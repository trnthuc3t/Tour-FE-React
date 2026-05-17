import { useState } from 'react';
import { formatPrice, formatDateTime } from '../utils';
import paymentService from '../services/paymentService';
import { useToast } from './Toast';

function BillPreview({ order }) {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { addToast } = useToast();

  const buildOdooInvoiceUrl = (rawUrl) => {
    if (!rawUrl) {
      return '';
    }

    const odooBase = 'http://localhost:8069';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      try {
        const parsed = new URL(rawUrl);
        return `${odooBase}${parsed.pathname}${parsed.search}`;
      } catch {
        return rawUrl;
      }
    }
    return `${odooBase}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
  };

  // Determine payment status based on invoice payment state or backend flag
  const isPaid = order.is_paid === true;
  const hasInvoice = order.invoice_ids && order.invoice_ids.length > 0;

  const handlePayment = async () => {
    try {
      setIsPaymentLoading(true);
      
      // Get product ID from order lines
      const productId = order.lines?.[0]?.product_id || null;
      
      const payload = {
        booking_payload: {
          product_id: productId,
          sale_order_id: order.id,
          order_name: order.name,
        },
        return_url: `${window.location.origin}/payment/payos/return`,
        cancel_url: `${window.location.origin}/orders/history`,
      };

      const result = await paymentService.createPayosPayment(payload);

      if (result.checkoutUrl || result.checkout_url) {
        window.location.href = result.checkoutUrl || result.checkout_url;
      } else {
        addToast('Không thể khởi tạo thanh toán. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('Payment error:', error);
      addToast(error.message || 'Lỗi khi xử lý thanh toán', 'error');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-[#e0e3e5] pt-4">
      {isPaid ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0f5132]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-[#0f5132]">Đã thanh toán</span>
          </div>

          {hasInvoice && order.invoice_ids.length > 0 && (
            <div className="bg-[#f0f4f8] rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-[#424751] uppercase">Thông tin hóa đơn</p>
              {order.invoice_ids.map((invoice, idx) => (
                <div key={invoice.id} className="space-y-1 pb-2 border-b border-[#e0e3e5] last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#424751]">Số hóa đơn:</span>
                    <span className="text-xs font-semibold text-[#191c1e]">{invoice.number || invoice.name || 'N/A'}</span>
                  </div>
                  {invoice.invoice_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#424751]">Ngày:</span>
                      <span className="text-xs text-[#191c1e]">{formatDateTime(invoice.invoice_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#424751]">Tổng tiền:</span>
                    <span className="text-xs font-semibold text-[#003974]">{formatPrice(invoice.amount_total || order.amount_total)}</span>
                  </div>
                  {invoice.payment_state && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#424751]">Trạng thái:</span>
                      <span className="text-xs px-2 py-1 bg-[#c8f7dc] text-[#0f5132] rounded-full font-semibold">
                        {invoice.payment_state === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </div>
                  )}

                  {invoice.payment_state === 'paid' && (invoice.preview_url || invoice.pdf_url) && (
                    <div className="pt-1">
                      <a
                        href={buildOdooInvoiceUrl(invoice.preview_url || invoice.pdf_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#003974] hover:text-[#0052a3]"
                      >
                        Xem bill
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14h14v-5" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#93000a]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-[#93000a]">Chưa thanh toán</span>
          </div>

          <div className="bg-[#fff3cd] rounded-lg p-4 border border-[#ffc107]/30">
            <p className="text-xs text-[#856404] mb-3">
              Vui lòng thanh toán để hoàn tất đơn đặt tour. Chúng tôi chấp nhận thanh toán qua PayOS.
            </p>
            <button
              onClick={handlePayment}
              disabled={isPaymentLoading}
              className="w-full px-4 py-2 bg-gradient-to-r from-[#003974] to-[#0066cc] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaymentLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Thanh toán ngay'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillPreview;
