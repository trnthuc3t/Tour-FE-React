import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../components';
import { formatPrice } from '../utils';

const steps = [
  { id: 1, name: 'Thông Tin Hành Khách' },
  { id: 2, name: 'Thanh Toán' },
  { id: 3, name: 'Xác Nhận' },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({ fullName: '', email: '', phone: '', specialRequests: '', paymentMethod: 'credit_card' });

  const tour = { id: 'tour-001', name: 'Private Voyage: Di Sản Vịnh Hạ Long & Lan Hạ', destination: 'Quảng Ninh, Việt Nam', duration: '3 Ngày 2 Đêm', price: 12500000, image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', guests: 2 };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setCurrentStep(3);
  };

  const totalPrice = tour.price * tour.guests;

  return (
    <div className="min-h-screen bg-[#f7f9fb] py-8">
      <div className="container-main">
        <div className="mb-8">
          <Link to="/tours" className="flex items-center gap-2 text-[#424751] hover:text-[#003974] mb-4">
            <span className="material-symbols-outlined">arrow_back</span>Quay về
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-[#191c1e]">Đặt Tour & Thanh Toán</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= step.id ? 'hero-gradient text-white' : 'bg-[#e0e3e5] text-[#424751]'}`}>
                  {currentStep > step.id ? <span className="material-symbols-outlined">check</span> : step.id}
                </div>
                <span className={`mt-2 text-sm font-medium ${currentStep >= step.id ? 'text-[#003974]' : 'text-[#424751]'}`}>{step.name}</span>
              </div>
              {idx < steps.length - 1 && <div className={`w-20 md:w-32 h-0.5 mx-2 ${currentStep > step.id ? 'bg-[#003974]' : 'bg-[#e0e3e5]'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow">
                <h2 className="text-xl font-bold text-[#191c1e] mb-6">Thông Tin Hành Khách</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Họ và tên *" name="fullName" placeholder="Nguyễn Văn A" value={bookingData.fullName} onChange={handleChange} icon="person" />
                    <Input label="Email *" type="email" name="email" placeholder="email@example.com" value={bookingData.email} onChange={handleChange} icon="mail" />
                  </div>
                  <Input label="Số điện thoại *" type="tel" name="phone" placeholder="0912 345 678" value={bookingData.phone} onChange={handleChange} icon="call" />
                  <div>
                    <label className="block text-sm font-medium text-[#424751] mb-1.5">Yêu cầu đặc biệt</label>
                    <textarea name="specialRequests" placeholder="Ví dụ: Chế độ ăn chay, dị ứng thực phẩm..." value={bookingData.specialRequests} onChange={handleChange} rows={3} className="input-ghost resize-none" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow">
                <h2 className="text-xl font-bold text-[#191c1e] mb-6">Phương Thức Thanh Toán</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { id: 'credit_card', icon: 'credit_card', label: 'Thẻ Tín Dụng/Ghi Nợ', desc: 'Visa, Mastercard, JCB' },
                    { id: 'bank_transfer', icon: 'account_balance', label: 'Chuyển Khoản Ngân Hàng', desc: 'Thanh toán qua ATM hoặc internet banking' },
                    { id: 'momo', icon: 'verified_user', label: 'Ví MoMo', desc: 'Thanh toán qua ứng dụng MoMo' },
                  ].map((method) => (
                    <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${bookingData.paymentMethod === method.id ? 'border-[#003974] bg-[#d6e3ff]/20' : 'border-[#e0e3e5] hover:border-[#c2c6d3]'}`}>
                      <input type="radio" name="paymentMethod" value={method.id} checked={bookingData.paymentMethod === method.id} onChange={handleChange} className="sr-only" />
                      <span className="material-symbols-outlined text-2xl text-[#003974]">{method.icon}</span>
                      <div className="flex-1"><p className="font-semibold text-[#191c1e]">{method.label}</p><p className="text-sm text-[#424751]">{method.desc}</p></div>
                      <span className={`material-symbols-outlined ${bookingData.paymentMethod === method.id ? 'text-[#003974]' : 'text-[#c2c6d3]'}`}>{bookingData.paymentMethod === method.id ? 'check_circle' : 'radio_button_unchecked'}</span>
                    </label>
                  ))}
                </div>
                {bookingData.paymentMethod === 'credit_card' && (
                  <div className="p-4 bg-[#f2f4f6] rounded-xl space-y-4">
                    <p className="text-sm font-semibold text-[#191c1e]">Thông Tin Thẻ (Demo)</p>
                    <Input label="Số Thẻ" placeholder="1234 5678 9012 3456" icon="credit_card" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Ngày Hết Hạn" placeholder="MM/YY" />
                      <Input label="CVV" placeholder="123" type="password" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#d6e3ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-[#003974]">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-[#191c1e] mb-2">Đặt Tour Thành Công!</h2>
                <p className="text-[#424751] mb-6">Cảm ơn bạn đã đặt tour. Chúng tôi đã gửi email xác nhận đến {bookingData.email || 'địa chỉ email của bạn'}.</p>
                <div className="bg-[#f2f4f6] rounded-xl p-4 text-left">
                  <p className="text-sm text-[#424751]">Mã đặt tour của bạn:</p>
                  <p className="text-xl font-bold text-[#003974]">TH-{Date.now().toString().slice(-8)}</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => navigate('/')}>Về Trang Chủ</Button>
                  <Button variant="primary" onClick={() => navigate('/tours')}>Tiếp Tục Khám Phá</Button>
                </div>
              </div>
            )}

            {currentStep < 3 && (
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 1}>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined">arrow_back</span>Quay Lại</span>
                </Button>
                <Button variant="primary" onClick={currentStep === 2 ? handleSubmit : () => setCurrentStep(currentStep + 1)} loading={loading}>
                  <span className="flex items-center gap-1">{currentStep === 2 ? 'Xác Nhận Thanh Toán' : 'Tiếp Tục'}<span className="material-symbols-outlined">arrow_forward</span></span>
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 editorial-shadow sticky top-24">
              <h3 className="font-bold text-[#191c1e] mb-4">Tóm Tắt Đơn Hàng</h3>
              <div className="space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden"><img src={tour.image} alt={tour.name} className="w-full h-full object-cover" /></div>
                <h4 className="font-semibold text-[#191c1e]">{tour.name}</h4>
                <div className="space-y-2 text-sm text-[#424751]">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">schedule</span>{tour.duration}</div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">location_on</span>{tour.destination}</div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">group</span>{tour.guests} khách</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e0e3e5] space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[#424751]">Giá tour</span><span className="text-[#191c1e]">{formatPrice(tour.price)} × {tour.guests}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#424751]">Phí dịch vụ</span><span className="text-[#191c1e]">0₫</span></div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#e0e3e5]"><span>Tổng Cộng</span><span className="text-[#003974]">{formatPrice(totalPrice)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
