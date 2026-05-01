import { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import livechatService from '../services/livechatService';

const ODOO_BASE_URL =
  import.meta.env.VITE_ODOO_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
const ODOO_CHANNEL_ID = import.meta.env.VITE_ODOO_LIVECHAT_CHANNEL_ID || '1';
const SCRIPT_SELECTOR = 'script[data-odoo-livechat-script="true"]';
const WIDGET_SELECTORS = ['.o-livechat-root'];
const LIVECHAT_STORAGE_PATTERNS = ['livechat', 'im_livechat', 'mail.guest', 'discuss'];
const LAST_USER_KEY = 'tour_livechat_last_user';

function removeExistingLivechat() {
  document.querySelectorAll(SCRIPT_SELECTOR).forEach((node) => node.remove());
  WIDGET_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => node.remove());
  });
}

function clearLivechatBrowserState() {
  const shouldRemove = (key) =>
    LIVECHAT_STORAGE_PATTERNS.some((pattern) => key.toLowerCase().includes(pattern));
  try {
    Object.keys(localStorage).forEach((key) => {
      if (shouldRemove(key)) localStorage.removeItem(key);
    });
  } catch (_) {}
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (shouldRemove(key)) sessionStorage.removeItem(key);
    });
  } catch (_) {}
}

function getLastUserId() {
  try { return localStorage.getItem(LAST_USER_KEY); } catch { return null; }
}

function setLastUserId(userId) {
  try {
    if (userId == null) localStorage.removeItem(LAST_USER_KEY);
    else localStorage.setItem(LAST_USER_KEY, String(userId));
  } catch (_) {}
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
      // Chỉ hiển thị livechat khi đã đăng nhập
      if (loading || !ODOO_CHANNEL_ID || !user) {
        removeExistingLivechat();
      return undefined;
    }

    let disposed = false;

    const bootstrapLivechat = async () => {
      let displayName = getFallbackDisplayName(user);

      try {
          const currentUserId = String(user.id);
          const prevUserId = getLastUserId();

          if (prevUserId !== null && prevUserId !== currentUserId) {
            // Đổi sang tài khoản khác: xóa browser state của tài khoản cũ
            // rồi reset dgid trước khi restore session của tài khoản mới
            clearLivechatBrowserState();
            await livechatService.resetSession();
          }

          setLastUserId(currentUserId);

          // Đồng bộ identity (lưu tên/email vào Odoo session)
          const result = await livechatService.syncIdentity();
          displayName = result?.response?.display_name || displayName;

          await livechatService.restoreSession();
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
