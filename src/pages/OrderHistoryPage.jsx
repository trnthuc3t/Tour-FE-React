import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components';
import { useAuthContext } from '../context/AuthContext';
import orderHistoryService from '../services/orderHistoryService';
import { formatDateTime, formatPrice } from '../utils';

const STATUS_STYLE = {
  draft: 'bg-[#e8def8] text-[#4a4458]',
  sent: 'bg-[#d6e3ff] text-[#003974]',
  sale: 'bg-[#c8f7dc] text-[#0f5132]',
  done: 'bg-[#c8f7dc] text-[#0f5132]',
  cancel: 'bg-[#ffdad6] text-[#93000a]',
};

function OrderHistoryPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        setLoading(false);
        setOrders([]);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await orderHistoryService.getOrderHistory({ limit: 50 });
        if (mounted) {
          setOrders(data?.orders || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Khong the tai lich su mua hang');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => ['sale', 'done'].includes(o.state)).length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.amount_total || 0), 0);
    return { totalOrders, completedOrders, totalSpent };
  }, [orders]);

  if (authLoading || loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] py-10">
        <div className="container-main">
          <div className="rounded-2xl bg-white p-8 editorial-shadow text-center">
            <h1 className="text-2xl font-bold text-[#191c1e] mb-2">Lich Su Mua Hang</h1>
            <p className="text-[#424751] mb-6">Ban can dang nhap de xem cac don du lich da mua.</p>
            <Link to="/login" className="inline-flex items-center rounded-full btn-gradient px-6 py-2 text-white font-semibold">
              Dang Nhap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] py-8">
      <div className="container-main">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#191c1e]">Lich Su Mua Hang</h1>
          <p className="text-[#424751] mt-2">Khach hang: {user?.name || user?.email || 'User'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white p-5 editorial-shadow">
            <p className="text-sm text-[#424751]">Tong Don Hang</p>
            <p className="text-2xl font-bold text-[#191c1e] mt-1">{stats.totalOrders}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 editorial-shadow">
            <p className="text-sm text-[#424751]">Don Da Mua</p>
            <p className="text-2xl font-bold text-[#191c1e] mt-1">{stats.completedOrders}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 editorial-shadow">
            <p className="text-sm text-[#424751]">Tong Gia Tri</p>
            <p className="text-2xl font-bold text-[#003974] mt-1">{formatPrice(stats.totalSpent)}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
            {error}
          </div>
        )}

        {!orders.length ? (
          <div className="rounded-2xl bg-white p-8 editorial-shadow text-center">
            <p className="text-[#424751] mb-4">Ban chua co don du lich nao.</p>
            <Link to="/tours" className="inline-flex items-center rounded-full btn-gradient px-6 py-2 text-white font-semibold">
              Kham Pha Tour
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white p-5 editorial-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#e0e3e5] pb-3 mb-4">
                  <div>
                    <p className="text-[#191c1e] font-bold">{order.name}</p>
                    <p className="text-sm text-[#424751]">Ngay dat: {order.date_order ? formatDateTime(order.date_order) : 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.state] || 'bg-[#e0e3e5] text-[#424751]'}`}>
                      {order.state_label || order.state}
                    </span>
                    <p className="text-base font-bold text-[#003974]">{formatPrice(order.amount_total || 0)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(order.lines || []).map((line) => (
                    <div key={line.id} className="flex items-start gap-3">
                      {line.image_url ? (
                        <img src={line.image_url} alt={line.product_name} className="h-12 w-12 rounded-lg object-cover border border-[#e0e3e5]" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-[#e0e3e5]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#191c1e] truncate">{line.product_name}</p>
                        <p className="text-xs text-[#424751]">So luong: {line.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#191c1e]">{formatPrice(line.price_total || line.price_subtotal || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistoryPage;
