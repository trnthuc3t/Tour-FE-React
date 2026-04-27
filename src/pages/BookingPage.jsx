import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button, Input, LoadingSpinner } from '../components';
import { formatPrice } from '../utils';
import { productService } from '../services/productService';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [preparingCombo, setPreparingCombo] = useState(false);
  const [product, setProduct] = useState(null);
  const [combos, setCombos] = useState([]);
  const [comboQuantities, setComboQuantities] = useState({});
  const [comboSelections, setComboSelections] = useState({});
  const [expandedComboItems, setExpandedComboItems] = useState([]);
  const [orderResult, setOrderResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [bookingData, setBookingData] = useState({ fullName: '', email: '', phone: '', specialRequests: '', paymentMethod: 'credit_card' });

  const productId = location.state?.productId;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoadingProduct(false);
        return;
      }

      setLoadingProduct(true);
      try {
        const response = await productService.getProductById(productId);
        const fetchedProduct = response?.product || null;
        const fetchedCombos = response?.combos || [];

        setProduct(fetchedProduct);
        setCombos(fetchedCombos);

        const defaultComboQuantities = {};
        const defaultComboSelections = {};
        fetchedCombos.forEach((combo) => {
          if (combo.is_car_service) {
            defaultComboSelections[combo.id] = null;
          } else {
            defaultComboQuantities[combo.id] = 1;
          }
        });
        setComboQuantities(defaultComboQuantities);
        setComboSelections(defaultComboSelections);
      } catch (error) {
        console.error('Failed to fetch booking product:', error);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const isComboProduct = Boolean(product?.is_combo);
  const isDayTour = Boolean(product?.is_day_tour);
  const isComboQuantityFlow = isComboProduct && !isDayTour && combos.length > 0;
  const carServiceCombos = useMemo(
    () => combos.filter((combo) => Boolean(combo.is_car_service)),
    [combos]
  );
  const standardCombos = useMemo(
    () => combos.filter((combo) => !combo.is_car_service),
    [combos]
  );
  const totalStandardComboQuantity = useMemo(
    () => standardCombos.reduce((sum, combo) => sum + Math.max(0, Number(comboQuantities[combo.id] || 0)), 0),
    [standardCombos, comboQuantities]
  );

  const isCarServiceItemSelectable = (item) => {
    const minQty = Number(item?.min_quantity ?? 0);
    const maxQty = Number(item?.max_quantity ?? 0);
    if (!Number.isFinite(minQty) || !Number.isFinite(maxQty)) {
      return false;
    }
    if (maxQty <= 0) {
      return totalStandardComboQuantity >= minQty;
    }
    return totalStandardComboQuantity >= minQty && totalStandardComboQuantity <= maxQty;
  };

  useEffect(() => {
    if (!carServiceCombos.length) {
      return;
    }
    setComboSelections((prev) => {
      let changed = false;
      const next = { ...prev };

      carServiceCombos.forEach((combo) => {
        const selectedId = Number(next[combo.id] || 0);
        if (!selectedId) {
          return;
        }
        const selectedItem = (combo.items || []).find(
          (item) => Number(item.combo_item_id || item.id) === selectedId
        );
        if (!selectedItem || !isCarServiceItemSelectable(selectedItem)) {
          next[combo.id] = null;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [carServiceCombos, totalStandardComboQuantity]);

  const stepsWithDynamicLabel = useMemo(
    () => [
      { id: 1, name: isComboQuantityFlow ? 'Chọn Số Lượng Combo' : 'Thông Tin Hành Khách' },
      { id: 2, name: 'Thanh Toán' },
      { id: 3, name: 'Xác Nhận' },
    ],
    [isComboQuantityFlow]
  );

  const fallbackTour = {
    id: 'tour-001',
    name: 'Private Voyage: Di Sản Vịnh Hạ Long & Lan Hạ',
    destination: 'Quảng Ninh, Việt Nam',
    duration: '3 Ngày 2 Đêm',
    price: 12500000,
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    guests: 2,
  };

  const tour = {
    id: product?.id || fallbackTour.id,
    name: product?.name || fallbackTour.name,
    destination: 'Việt Nam',
    duration: '3 Ngày 2 Đêm',
    price: product?.list_price || fallbackTour.price,
    image: product?.image_url || fallbackTour.image,
    guests: 1,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!Number(tour.id)) {
      setSubmitError('Khong tim thay san pham dat tour. Vui long quay lai trang chi tiet san pham.');
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      const payload = {
        product_id: tour.id,
        product_qty: tour.guests || 1,
        full_name: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone,
        special_requests: bookingData.specialRequests,
        payment_method: bookingData.paymentMethod,
      };

      if (isComboQuantityFlow) {
        payload.combo_quantities = comboQuantities;
        payload.combo_selections = comboSelections;
      }

      const response = await productService.createOrder(payload);
      setOrderResult(response?.order || null);
      setCurrentStep(3);
    } catch (error) {
      setSubmitError(error?.message || 'Khong the tao don hang tren Odoo');
    } finally {
      setLoading(false);
    }
  };

  const handleComboQuantityChange = (comboId, value) => {
    const parsed = Number(value);
    const safeQty = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
    setComboQuantities((prev) => ({ ...prev, [comboId]: safeQty }));
  };

  const handleComboQuantityStep = (comboId, delta) => {
    const currentQty = Number(comboQuantities[comboId] ?? 0);
    handleComboQuantityChange(comboId, currentQty + delta);
  };

  const handleCarServiceSelection = (comboId, comboItemId) => {
    setComboSelections((prev) => ({ ...prev, [comboId]: comboItemId }));
  };

  const handleNextStep = async () => {
    if (currentStep === 1 && isComboQuantityFlow) {
      const hasAnyStandardComboQuantity = standardCombos.length === 0
        ? true
        : standardCombos.some((combo) => Number(comboQuantities[combo.id] || 0) > 0);
      const hasAllCarServiceSelections = carServiceCombos.every(
        (combo) => Number(comboSelections[combo.id] || 0) > 0
      );

      const hasInvalidCarServiceSelection = carServiceCombos.some((combo) => {
        const selectedId = Number(comboSelections[combo.id] || 0);
        if (!selectedId) {
          return false;
        }
        const selectedItem = (combo.items || []).find(
          (item) => Number(item.combo_item_id || item.id) === selectedId
        );
        return !selectedItem || !isCarServiceItemSelectable(selectedItem);
      });

      if (!hasAnyStandardComboQuantity) {
        setSubmitError('Vui long chon so luong lon hon 0 cho it nhat 1 combo thuong.');
        return;
      }

      if (!hasAllCarServiceSelections) {
        setSubmitError('Vui long chon san pham cho tat ca combo Car Service.');
        return;
      }

      if (hasInvalidCarServiceSelection) {
        setSubmitError('Lua chon Car Service khong nam trong khoang min/max hop le theo tong so luong combo.');
        return;
      }

      setPreparingCombo(true);
      setSubmitError('');
      try {
        const response = await productService.prepareComboItems(tour.id, comboQuantities, comboSelections);
        setExpandedComboItems(response?.expanded_items || []);
      } catch (error) {
        console.error('Failed to prepare combo items:', error);
        setExpandedComboItems([]);
        setSubmitError(error?.message || 'Khong the xu ly combo items');
        return;
      } finally {
        setPreparingCombo(false);
      }
    }

    if (currentStep === 2) {
      await handleSubmit();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const totalPrice = tour.price * tour.guests;

  if (loadingProduct) {
    return <LoadingSpinner fullScreen />;
  }

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
          {stepsWithDynamicLabel.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= step.id ? 'hero-gradient text-white' : 'bg-[#e0e3e5] text-[#424751]'}`}>
                  {currentStep > step.id ? <span className="material-symbols-outlined">check</span> : step.id}
                </div>
                <span className={`mt-2 text-sm font-medium ${currentStep >= step.id ? 'text-[#003974]' : 'text-[#424751]'}`}>{step.name}</span>
              </div>
              {idx < stepsWithDynamicLabel.length - 1 && <div className={`w-20 md:w-32 h-0.5 mx-2 ${currentStep > step.id ? 'bg-[#003974]' : 'bg-[#e0e3e5]'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {submitError && (
              <div className="mb-4 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
                {submitError}
              </div>
            )}

            {currentStep === 1 && !isComboQuantityFlow && (
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

            {currentStep === 1 && isComboQuantityFlow && (
              <div className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow">
                <h2 className="text-xl font-bold text-[#191c1e] mb-2">Chọn Số Lượng Theo Combo</h2>
                <p className="text-sm text-[#424751] mb-6">
                  Combo thuong: nhap so luong nhu cu. Combo Car Service: chon san pham trong combo, khong can nhap so luong.
                </p>

                <div className="space-y-4">
                  {combos.map((combo) => (
                    <div key={combo.id} className="rounded-xl border border-[#e0e3e5] p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <h3 className="font-semibold text-[#191c1e]">{combo.name}</h3>
                        {combo.is_car_service ? (
                          <span className="inline-flex items-center rounded-full bg-[#d6e3ff] px-2.5 py-1 text-xs font-semibold text-[#003974]">
                            Car Service
                          </span>
                        ) : (
                          <div className="w-full md:w-[124px]">
                            <p className="mb-1.5 text-xs font-medium text-[#424751]">Số lượng</p>
                            <div className="flex items-center rounded-lg border border-[#e0e3e5] bg-[#f7f9fb] p-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => handleComboQuantityStep(combo.id, -1)}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-lg font-medium leading-none text-[#191c1e] transition-colors hover:bg-[#f2f4f6] disabled:cursor-not-allowed disabled:text-[#c2c6d3]"
                                disabled={(comboQuantities[combo.id] ?? 0) <= 0}
                                aria-label={`Giảm số lượng ${combo.name}`}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={comboQuantities[combo.id] ?? 0}
                                onChange={(e) => handleComboQuantityChange(combo.id, e.target.value)}
                                className="h-7 w-8 flex-1 bg-transparent px-1 text-center text-sm font-semibold text-[#191c1e] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                aria-label={`Nhập số lượng ${combo.name}`}
                              />
                              <button
                                type="button"
                                onClick={() => handleComboQuantityStep(combo.id, 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-lg font-medium leading-none text-[#191c1e] transition-colors hover:bg-[#f2f4f6]"
                                aria-label={`Tăng số lượng ${combo.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-[#f7f9fb] rounded-lg p-3">
                        {combo.is_car_service ? (
                          <>
                            <p className="text-xs font-semibold text-[#424751] mb-2">Chọn 1 sản phẩm Car Service:</p>
                            <div className="space-y-2">
                              {(combo.items || []).map((item) => {
                                const selected = Number(comboSelections[combo.id] || 0) === Number(item.combo_item_id || item.id);
                                const itemId = item.combo_item_id || item.id;
                                const canSelect = isCarServiceItemSelectable(item);
                                return (
                                  <label
                                    key={item.id}
                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-55'} ${selected ? 'border-[#003974] bg-[#d6e3ff]/25' : 'border-[#e0e3e5] bg-white'} ${canSelect ? 'hover:border-[#c2c6d3]' : ''}`}
                                  >
                                    <div className="flex items-center gap-2 text-[#191c1e]">
                                      <input
                                        type="radio"
                                        name={`car-service-${combo.id}`}
                                        checked={selected}
                                        onChange={() => handleCarServiceSelection(combo.id, itemId)}
                                        disabled={!canSelect}
                                      />
                                      <span>{item.product_name}</span>
                                    </div>
                                    <div className="text-right text-[#424751]">
                                      <div>x {item.quantity || 1}</div>
                                      <div className="text-[11px]">Min {item.min_quantity} - Max {item.max_quantity}</div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-semibold text-[#424751] mb-2">Sản phẩm sẽ tự thêm:</p>
                            <ul className="space-y-1">
                              {(combo.items || []).map((item) => (
                                <li key={item.id} className="text-sm text-[#191c1e] flex items-center justify-between">
                                  <span>{item.product_name}</span>
                                  <span className="text-[#424751]">x {item.quantity || 1}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow">
                <h2 className="text-xl font-bold text-[#191c1e] mb-6">Phương Thức Thanh Toán</h2>
                {isComboQuantityFlow && expandedComboItems.length > 0 && (
                  <div className="mb-6 rounded-xl border border-[#e0e3e5] p-4 bg-[#f7f9fb]">
                    <p className="font-semibold text-[#191c1e] mb-2">Danh sách tự động từ combo</p>
                    <div className="space-y-2 max-h-52 overflow-auto pr-1">
                      {expandedComboItems.map((item, idx) => (
                        <div key={`${item.combo_item_id}-${idx}`} className="text-sm flex items-center justify-between text-[#424751]">
                          <span>{item.combo_name} - {item.product_name}</span>
                          <span>x {item.line_quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  <p className="text-xl font-bold text-[#003974]">{orderResult?.name || `TH-${Date.now().toString().slice(-8)}`}</p>
                  {orderResult?.amount_total ? (
                    <p className="text-sm text-[#424751] mt-1">
                      Tong thanh toan: <span className="font-semibold text-[#191c1e]">{formatPrice(orderResult.amount_total)}</span>
                    </p>
                  ) : null}
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
                <Button variant="primary" onClick={handleNextStep} loading={loading || preparingCombo}>
                  <span className="flex items-center gap-1">
                    {currentStep === 2 ? 'Xác Nhận Thanh Toán' : 'Tiếp Tục'}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </span>
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
