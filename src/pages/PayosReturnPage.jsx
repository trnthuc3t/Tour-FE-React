import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, LoadingSpinner } from '../components';
import { paymentService } from '../services/paymentService';
import { formatPrice } from '../utils';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function PayosReturnPage() {
  const [searchParams] = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [verifyError, setVerifyError] = useState('');
  const [verifiedStatus, setVerifiedStatus] = useState(null);

  const orderCode = searchParams.get('orderCode') || searchParams.get('order_code') || '';
  const status = searchParams.get('status') || '';
  const responseCode = searchParams.get('code') || '';
  const message = searchParams.get('desc') || '';
  const canceled = searchParams.get('cancel') || '';

  useEffect(() => {
    const verify = async () => {
      if (!orderCode) {
        setChecking(false);
        return;
      }

      setChecking(true);
      setVerifyError('');
      try {
        const params = Object.fromEntries(searchParams.entries());
        const result = await paymentService.getPayosPaymentStatus(params);
        setVerifiedStatus(result);
      } catch (error) {
        setVerifyError(error?.message || 'Khong the xac minh trang thai giao dich');
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [orderCode, searchParams]);

  const isSuccess = useMemo(() => {
    if (verifiedStatus && typeof verifiedStatus.is_success === 'boolean') {
      return verifiedStatus.is_success;
    }

    const normalizedStatus = (status || '').toUpperCase();
    const normalizedCode = (responseCode || '').toUpperCase();
    const isCanceled = String(canceled || '').toLowerCase() === 'true' || String(canceled || '') === '1';
    if (isCanceled) {
      return false;
    }
    return normalizedStatus === 'PAID' || normalizedStatus === 'SUCCESS' || normalizedCode === '00';
  }, [status, responseCode, canceled, verifiedStatus]);

  const amount = toNumber(verifiedStatus?.amount || searchParams.get('amount'));
  const finalMessage =
    verifiedStatus?.message || message || (isSuccess ? 'Thanh toan thanh cong' : 'Thanh toan that bai');

  if (checking) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] py-8">
      <div className="container-main max-w-2xl">
        <div className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow text-center">
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isSuccess ? 'bg-[#d6e3ff]' : 'bg-[#ffdad6]'}`}
          >
            <span className={`material-symbols-outlined text-4xl ${isSuccess ? 'text-[#003974]' : 'text-[#93000a]'}`}>
              {isSuccess ? 'check_circle' : 'error'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#191c1e] mb-2">
            {isSuccess ? 'Thanh toan PayOS thanh cong' : 'Thanh toan PayOS chua thanh cong'}
          </h1>
          <p className="text-[#424751] mb-6">{finalMessage}</p>

          <div className="rounded-xl border border-[#e0e3e5] bg-[#f2f4f6] p-4 text-left space-y-2">
            {orderCode ? (
              <p className="text-sm text-[#424751]">
                Mã giao dịch: <span className="font-semibold text-[#191c1e]">{orderCode}</span>
              </p>
            ) : null}
            {amount > 0 ? (
              <p className="text-sm text-[#424751]">
                Số tiền: <span className="font-semibold text-[#191c1e]">{formatPrice(amount)}</span>
              </p>
            ) : null}
            <p className="text-sm text-[#424751]">
              Trạng thái: <span className={`font-semibold ${isSuccess ? 'text-[#0f6a00]' : 'text-[#93000a]'}`}>{isSuccess ? 'Thanh cong' : 'That bai'}</span>
            </p>
          </div>

          {verifyError ? <p className="text-xs text-[#93000a] mt-3">{verifyError}</p> : null}

          <div className="flex gap-3 mt-6 justify-center">
            <Link to="/orders/history">
              <Button variant="outline">Xem lịch sử mua hàng</Button>
            </Link>
            <Link to="/tours">
              <Button variant="primary">Tiếp tục đặt tour</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayosReturnPage;