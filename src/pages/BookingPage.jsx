import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button, Input, LoadingSpinner, Modal } from '../components';
import { formatPrice } from '../utils';
import { productService } from '../services/productService';
import { paymentService } from '../services/paymentService';

const formatLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const buildDepartureDates = (count = 10) => {
  const dates = [];
  const firstDate = addDays(new Date(), 1);

  for (let index = 0; index < count; index += 1) {
    const currentDate = addDays(firstDate, index);
    dates.push({
      value: formatLocalDateString(currentDate),
      weekday: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(currentDate),
      label: new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(currentDate),
    });
  }

  return dates;
};

const formatDisplayDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const BOOKING_RESUME_STORAGE_KEY = 'tour_booking_resume';

const parseStoredBookingResume = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(BOOKING_RESUME_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const datesScrollRef = useRef(null);
  const hiddenDateInputRef = useRef(null);
  const searchParams = new URLSearchParams(location.search);
  const shouldResumePayosCancel = searchParams.get('resume') === 'payos_cancel';
  const storedBookingResume = useMemo(
    () => (shouldResumePayosCancel ? parseStoredBookingResume() : null),
    [shouldResumePayosCancel]
  );
  const [currentStep, setCurrentStep] = useState(() => (
    shouldResumePayosCancel && storedBookingResume ? 2 : 1
  ));
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [preparingCombo, setPreparingCombo] = useState(false);
  const [product, setProduct] = useState(null);
  const [combos, setCombos] = useState([]);
  const [comboQuantities, setComboQuantities] = useState(() => storedBookingResume?.comboQuantities || {});
  const [comboSelections, setComboSelections] = useState(() => storedBookingResume?.comboSelections || {});
  const [expandedComboItems, setExpandedComboItems] = useState(() => storedBookingResume?.expandedComboItems || []);
  const [orderResult, setOrderResult] = useState(null);
  const [submitError, setSubmitError] = useState(() => (
    shouldResumePayosCancel ? 'Thanh toan PayOS da bi huy. Ban co the chon lai phuong thuc thanh toan hoac thu lai PayOS.' : ''
  ));
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(
    () => storedBookingResume?.selectedDepartureDate || formatLocalDateString(addDays(new Date(), 1))
  );
  const [bookingData, setBookingData] = useState(() => ({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    paymentMethod: 'credit_card',
    ...(storedBookingResume?.bookingData || {}),
  }));
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const productId = location.state?.productId ?? storedBookingResume?.productId;
  const variantIdFromState = location.state?.variantId ?? storedBookingResume?.variantId;
  const productPriceFromState = location.state?.productPrice ?? storedBookingResume?.productPrice;

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
        setComboQuantities((prev) => (
          Object.keys(prev || {}).length ? prev : defaultComboQuantities
        ));
        setComboSelections((prev) => (
          Object.keys(prev || {}).length ? prev : defaultComboSelections
        ));
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

  const departureDates = useMemo(() => buildDepartureDates(10), []);

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

  const guestsCount = isComboQuantityFlow ? totalStandardComboQuantity : 1;

  const tour = {
    id: product?.id || fallbackTour.id,
    name: product?.name || fallbackTour.name,
    destination: 'Việt Nam',
    duration: '3 Ngày 2 Đêm',
    price: Number(productPriceFromState ?? product?.list_price ?? fallbackTour.price),
    image: product?.image_url || fallbackTour.image,
    guests: guestsCount,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCalendar = () => {
    const input = hiddenDateInputRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
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
        variant_id: variantIdFromState || undefined,
        product_qty: tour.guests || 1,
        full_name: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone,
        special_requests: bookingData.specialRequests,
        payment_method: bookingData.paymentMethod,
        commitment_date: selectedDepartureDate,
      };

      if (isComboQuantityFlow) {
        payload.combo_quantities = comboQuantities;
        payload.combo_selections = comboSelections;
      }

      if (bookingData.paymentMethod === 'payos') {
        const origin = window.location.origin;
        const resumePayload = {
          productId: tour.id,
          variantId: variantIdFromState || null,
          productPrice: tour.price,
          bookingData,
          selectedDepartureDate,
          comboQuantities,
          comboSelections,
          expandedComboItems,
        };
        window.sessionStorage.setItem(BOOKING_RESUME_STORAGE_KEY, JSON.stringify(resumePayload));

        const paymentResponse = await paymentService.createPayosPayment({
          booking_payload: payload,
          return_url: `${origin}/payment/payos/return`,
          cancel_url: `${origin}/booking?resume=payos_cancel`,
          notify_url: `${origin}/api/payments/payos/webhook`,
        });

        const payUrl = paymentResponse?.pay_url || paymentResponse?.payUrl || '';
        if (!payUrl) {
          throw new Error('Khong nhan duoc link thanh toan PayOS');
        }

        window.location.href = payUrl;
        return;
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

  const getComboItemUnitPrice = (item = {}) => {
    const fixedPrice = Number(item.fixed_price || 0);
    if (fixedPrice > 0) {
      return fixedPrice;
    }
    return Number(item.extra_price || 0);
  };

  const standardComboPrice = useMemo(() => {
    if (!isComboProduct) {
      return 0;
    }

    let additional = 0;
    standardCombos.forEach((combo) => {
      const comboQty = Number(comboQuantities[combo.id] || 0);
      if (comboQty <= 0) {
        return;
      }
      (combo.items || []).forEach((item) => {
        const itemQty = Number(item.quantity || 1);
        additional += getComboItemUnitPrice(item) * itemQty * comboQty;
      });
    });

    return additional;
  }, [isComboProduct, standardCombos, comboQuantities]);

  const carServicePrice = useMemo(() => {
    if (!isComboProduct) {
      return 0;
    }

    let additional = 0;
    carServiceCombos.forEach((combo) => {
      const selectedId = Number(comboSelections[combo.id] || 0);
      if (!selectedId) {
        return;
      }
      const selectedItem = (combo.items || []).find(
        (item) => Number(item.combo_item_id || item.id) === selectedId
      );
      if (!selectedItem) {
        return;
      }
      const itemQty = Number(selectedItem.quantity || 1);
      additional += getComboItemUnitPrice(selectedItem) * itemQty;
    });

    return additional;
  }, [isComboProduct, carServiceCombos, comboSelections]);

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
        setSubmitError('Vui lòng chọn số lượng lớn hơn 0.');
        return;
      }

      if (!hasAllCarServiceSelections) {
        setSubmitError('Vui lòng chọn sản phẩm.');
        return;
      }

      if (hasInvalidCarServiceSelection) {
        setSubmitError('Lựa chọn Car Service không nằm trong khoảng min/max hợp lệ theo tổng số lượng combo.');
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

  const tourPriceDisplay = (tour.price * tour.guests) + standardComboPrice;
  const totalPrice = tourPriceDisplay + carServicePrice;

  if (loadingProduct) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] py-8">
      <input
        ref={hiddenDateInputRef}
        type="date"
        value={selectedDepartureDate}
        min={formatLocalDateString(addDays(new Date(), 1))}
        onChange={(e) => setSelectedDepartureDate(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
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

            {currentStep === 1 && (
              <div className="bg-white rounded-2xl p-4 md:p-5 editorial-shadow mb-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenCalendar}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#d6e3ff] bg-[#eef4ff] px-4 py-3 font-semibold text-[#003974] transition-colors hover:bg-[#e2ecff]"
                    >
                      <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                      Xem lịch
                    </button>
                    <div className="hidden md:block text-sm text-[#424751]">
                      Chọn ngày khởi hành cho chuyến đi
                    </div>
                  </div>

                  <div className="relative">
                    <div
                      ref={datesScrollRef}
                      className="flex items-stretch gap-3 overflow-x-auto pb-2 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {departureDates.map((dateOption) => {
                        const isSelected = selectedDepartureDate === dateOption.value;

                        return (
                          <button
                            key={dateOption.value}
                            type="button"
                            onClick={() => setSelectedDepartureDate(dateOption.value)}
                            className={`min-w-[88px] rounded-xl border px-3 py-3 text-center transition-all ${isSelected ? 'border-[#2696ff] bg-[#d6e3ff] text-[#003974] shadow-sm' : 'border-[#d0d7de] bg-white text-[#191c1e] hover:border-[#9fb7d3] hover:bg-[#f7f9fb]'}`}
                          >
                            <div className="text-sm font-semibold">{dateOption.weekday}</div>
                            <div className="mt-1 text-base font-bold leading-tight">{dateOption.label}</div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        datesScrollRef.current?.scrollBy({ left: 420, behavior: 'smooth' });
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 hidden h-11 w-11 items-center justify-center rounded-full border border-[#d0d7de] bg-white text-[#191c1e] shadow-sm transition-colors hover:bg-[#f7f9fb] md:flex"
                      aria-label="Cuộn sang ngày tiếp theo"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#424751]">
                    Ngày đã chọn: <span className="font-semibold text-[#003974]">{formatDisplayDate(selectedDepartureDate)}</span>
                  </p>
                </div>
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
                                  <span className="text-[#424751]">x {item.quantity || 1} {getComboItemUnitPrice(item) > 0 ? `(${formatPrice(getComboItemUnitPrice(item))})` : ''}</span>
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
                    { id: 'payos', icon: 'verified_user', label: 'PayOS', desc: 'Thanh toán qua cổng PayOS' },
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

            {currentStep === 2 && (
              <div className="flex items-start gap-2.5 mt-6 p-4 bg-white rounded-2xl border border-[#e0e3e5] shadow-sm">
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#c2c6d3] text-[#003974] focus:ring-[#003974]/20 cursor-pointer"
                />
                <label htmlFor="accept-terms" className="text-sm text-[#424751] leading-relaxed cursor-pointer select-none">
                  Tôi đã đọc và đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-bold text-[#003974] hover:underline"
                  >
                    Điều khoản dịch vụ & Chính sách đặt tour
                  </button>{' '}
                  của The Terra Tour.
                </label>
              </div>
            )}

            {currentStep < 3 && (
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 1}>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined">arrow_back</span>Quay Lại</span>
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleNextStep} 
                  loading={loading || preparingCombo}
                  disabled={currentStep === 2 && !acceptedTerms}
                >
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
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">calendar_month</span>{formatDisplayDate(selectedDepartureDate)}</div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">group</span>{tour.guests} khách</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e0e3e5] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#424751]">Giá tour</span>
                  <span className="text-[#191c1e]">
                    {isComboProduct ? formatPrice(tourPriceDisplay) : `${formatPrice(tour.price)} × ${tour.guests}`}
                  </span>
                </div>
                {isComboProduct && carServicePrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#424751]">Phí dịch vụ di chuyển</span>
                    <span className="text-[#191c1e]">{formatPrice(carServicePrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#e0e3e5]">
                  <span>Tổng Cộng</span>
                  <span className="text-[#003974]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Điều Khoản Dịch Vụ & Chính Sách Đặt Tour" size="lg">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 text-sm text-[#424751] leading-relaxed">
          <div>
            <h3 className="font-bold text-[#191c1e] text-base mb-2">1. Quy Định Đăng Ký & Thanh Toán</h3>
            <p>
              Khách hàng cần cung cấp đầy đủ thông tin cá nhân chính xác theo hộ chiếu hoặc CCCD khi thực hiện giao dịch đặt tour.
              Việc thanh toán phải được thực hiện theo đúng phương thức và thời hạn quy định cho từng tour. Yêu cầu đặt tour chỉ được xác nhận chính thức sau khi hệ thống ghi nhận khoản thanh toán thành công.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#191c1e] text-base mb-2">2. Chính Sách Hoàn Hủy Tour</h3>
            <p className="mb-2">Mức phí hủy tour được áp dụng dựa trên thời điểm khách hàng thông báo hủy trước ngày khởi hành:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Trước từ 15 ngày trở lên:</strong> Miễn phí hủy tour (hoàn 100% số tiền đã đóng).</li>
              <li><strong>Từ 7 đến 14 ngày:</strong> Phí hủy tour tương đương 50% tổng giá trị tour.</li>
              <li><strong>Từ 3 đến 6 ngày:</strong> Phí hủy tour tương đương 75% tổng giá trị tour.</li>
              <li><strong>Trong vòng 72 giờ:</strong> Phí hủy tour tương đương 100% tổng giá trị tour, không hoàn lại tiền.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#191c1e] text-base mb-2">3. Trường Hợp Bất Khả Kháng</h3>
            <p>
              The Terra Tour không chịu trách nhiệm bồi thường đối với các thiệt hại hoặc hủy tour phát sinh do các nguyên nhân bất khả kháng như thiên tai, dịch bệnh, chiến tranh, đình công, sự cố kỹ thuật của phương tiện vận chuyển, hoặc các thay đổi lịch trình từ hãng hàng không, cơ quan chính phủ.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#191c1e] text-base mb-2">4. Trách Nhiệm Của Khách Hàng</h3>
            <p>
              Khách hàng tự chịu trách nhiệm chuẩn bị các giấy tờ cá nhân hợp lệ (CCCD, Hộ chiếu, Visa đối với tour quốc tế) và tự túc có mặt đúng giờ theo lịch trình quy định. Khách hàng phải tuân thủ hướng dẫn của Hướng dẫn viên và các quy định an toàn tại điểm đến.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#191c1e] text-base mb-2">5. Bảo Hiểm Du Lịch</h3>
            <p>
              Tất cả các tour trọn gói của The Terra Tour đã bao gồm bảo hiểm du lịch toàn diện trong suốt hành trình với mức bồi thường tối đa 100,000,000đ/vụ.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#191c1e] text-base mb-2">6. Chính Sách Bảo Mật Thông Tin</h3>
            <p>
              Chúng tôi cam kết bảo mật tuyệt đối các thông tin cá nhân thu thập được từ khách hàng. Mọi thông tin chỉ được sử dụng cho mục đích hoàn tất thủ tục đặt chỗ, quản lý đơn hàng trên hệ thống Odoo và liên hệ hỗ trợ trong hành trình.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e0e3e5]">
          <Button variant="outline" onClick={() => setShowTermsModal(false)}>Đóng</Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setAcceptedTerms(true);
              setShowTermsModal(false);
            }}
          >
            Đồng Ý Điều Khoản
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookingPage;
