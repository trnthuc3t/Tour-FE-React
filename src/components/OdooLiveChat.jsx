import { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import livechatService from '../services/livechatService';

// URL tuyệt đối đến Odoo – livechat embed được thiết kế chạy cross-origin qua CORS bundle
const ODOO_BASE_URL = import.meta.env.VITE_ODOO_BASE_URL || 'http://localhost:8070';
const ODOO_CHANNEL_ID = import.meta.env.VITE_ODOO_LIVECHAT_CHANNEL_ID || '1';
const SCRIPT_SELECTOR = 'script[data-odoo-livechat-script="true"]';
const WIDGET_SELECTORS = ['.o-livechat-root'];

function removeExistingLivechat() {
  document.querySelectorAll(SCRIPT_SELECTOR).forEach((node) => node.remove());
  WIDGET_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => node.remove());
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.type = 'text/javascript';
    script.dataset.odooLivechatScript = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Khong the tai livechat script: ${src}`));
    document.body.appendChild(script);
  });
}

function buildLoaderUrl(displayName) {
  const params = new URLSearchParams({
    username: displayName || 'Visitor',
  });
  return `${ODOO_BASE_URL}/im_livechat/loader/${ODOO_CHANNEL_ID}?${params.toString()}`;
}

function buildAssetsUrl() {
  return `${ODOO_BASE_URL}/im_livechat/assets_embed.js`;
}

function getFallbackDisplayName(user) {
  if (!user) {
    return 'Visitor';
  }
  return [user.name, user.email].filter(Boolean).join(' | ') || 'Visitor';
}

function OdooLiveChat() {
  const { loading, user } = useAuthContext();

  useEffect(() => {
    if (loading || !ODOO_CHANNEL_ID) {
      return undefined;
    }

    let disposed = false;

    const bootstrapLivechat = async () => {
      let displayName = getFallbackDisplayName(user);

      try {
        if (user) {
          const result = await livechatService.syncIdentity();
          displayName = result?.response?.display_name || displayName;
        } else {
          await livechatService.clearIdentity();
        }
      } catch (error) {
        console.warn('[OdooLiveChat] Identity sync failed:', error.message);
      }

      if (disposed) {
        return;
      }

      removeExistingLivechat();

      try {
        await loadScript(buildLoaderUrl(displayName));
        if (!disposed) {
          await loadScript(buildAssetsUrl());
        }
      } catch (error) {
        console.warn('[OdooLiveChat] Livechat bootstrap failed:', error.message);
      }
    };

    bootstrapLivechat();

    return () => {
      disposed = true;
    };
  }, [loading, user?.id, user?.name, user?.email]);

  return null;
}

export default OdooLiveChat;
