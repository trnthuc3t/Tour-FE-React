import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner, Modal } from '../components';
import { productService } from '../services/productService';
import { formatPrice, generateStarRating } from '../utils';
import { useAuthContext } from '../context/AuthContext';

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toAbsoluteAssetUrl = (value = '') => {
  if (!value || /^(https?:|data:|blob:|mailto:|tel:|#)/i.test(value)) {
    return value;
  }

  return value.startsWith('/') ? value : `/${value}`;
};

const normalizeSrcSet = (srcset = '') =>
  srcset
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [url, descriptor] = entry.split(/\s+/, 2);
      const normalizedUrl = toAbsoluteAssetUrl(url);
      return descriptor ? `${normalizedUrl} ${descriptor}` : normalizedUrl;
    })
    .join(', ');

const normalizeDetailInformation = (html = '') => {
  if (!html || typeof window === 'undefined') {
    return html;
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('img, source, iframe, video').forEach((element) => {
    const src = element.getAttribute('src');
    if (src) {
      element.setAttribute('src', toAbsoluteAssetUrl(src));
    }

    const poster = element.getAttribute('poster');
    if (poster) {
      element.setAttribute('poster', toAbsoluteAssetUrl(poster));
    }

    const srcset = element.getAttribute('srcset');
    if (srcset) {
      element.setAttribute('srcset', normalizeSrcSet(srcset));
    }
  });

  doc.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (href) {
      anchor.setAttribute('href', toAbsoluteAssetUrl(href));
    }
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noreferrer noopener');
  });

  return doc.body.innerHTML;
};

const buildGoogleMapsEmbedUrl = (mapUrl = '', address = '') => {
  const fallbackQuery = address || mapUrl;
  if (!fallbackQuery) {
    return '';
  }

  const normalizedMapUrl = mapUrl.trim();
  if (normalizedMapUrl.includes('/maps/embed')) {
    return normalizedMapUrl;
  }

  if (normalizedMapUrl.includes('google.com/maps')) {
    try {
      const parsed = new URL(normalizedMapUrl);
      const query = parsed.searchParams.get('q') || parsed.searchParams.get('query') || fallbackQuery;
      return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    } catch {
      return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
    }
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
};

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [variantAttributes, setVariantAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({});
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const selectedVariant = variants.find((variant) => Number(variant.id) === Number(selectedVariantId)) || null;
  const displayedPrice = (!tour?.isCombo && selectedVariant)
    ? Number(selectedVariant.list_price || 0)
    : Number(tour?.price || 0);

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductById(id);
        const product = response?.product || {};
        const detailInformation = normalizeDetailInformation(product.detail_information || '');
        const detailText = stripHtml(detailInformation);

        const mappedTour = {
          id: product.id,
          name: product.name || 'Sản phẩm du lịch',
          destination: product.tour_location_address || 'Việt Nam',
          duration: product.tour_duration || '3 Ngày 2 Đêm',
          rating: 4.5,
          reviewCount: 0,
          price: product.list_price || 0,
          badge: '',
          image: product.image_url || '',
          quotationDescription: product.description || '',
          description: detailText || '',
          locationAddress: product.tour_location_address || '',
          locationMapUrl: product.tour_location_map_url || '',

          detailInformation,
          isCombo: Boolean(product.is_combo),
          isComboMultipleChoice: Boolean(product.is_combo_multiple_choice),
          isDayTour: Boolean(product.is_day_tour),
          isSinglePurchaseAvailable: Boolean(product.is_single_purchase_available),
          combos: response?.combos || [],
          highlights: [],
          itinerary: [],
          includes: [],
          excludes: [],
          reviews: [],
        };

        const attributes = response?.variant_attributes || [];
        const variantsData = response?.variants || [];
        const defaultVariantId = response?.default_variant_id || variantsData[0]?.id || null;

        setVariantAttributes(attributes);
        setVariants(variantsData);

        const defaultVariant = variantsData.find((item) => item.id === defaultVariantId) || variantsData[0] || null;
        if (defaultVariant) {
          const initSelection = {};
          (defaultVariant.attribute_values || []).forEach((attr) => {
            initSelection[attr.attribute_id] = attr.id;
          });
          setSelectedAttributeValues(initSelection);
          setSelectedVariantId(defaultVariant.id);
        } else {
          setSelectedAttributeValues({});
          setSelectedVariantId(null);
        }

        setTour(mappedTour);
      } catch (error) {
        console.error('Failed to fetch tour:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setShowBookingModal(true);
  };

  useEffect(() => {
    if (!variants.length || !variantAttributes.length || tour?.isCombo) {
      return;
    }

    const selectedValueIds = Object.values(selectedAttributeValues).map((value) => Number(value));
    if (!selectedValueIds.length) {
      return;
    }

    const matched = variants.find((variant) => {
      const variantValueIds = (variant.attribute_value_ids || []).map((value) => Number(value));
      if (variantValueIds.length !== selectedValueIds.length) {
        return false;
      }
      return selectedValueIds.every((id) => variantValueIds.includes(id));
    });

    if (matched) {
      setSelectedVariantId(matched.id);
    }
  }, [selectedAttributeValues, variants, variantAttributes, tour?.isCombo]);

  const handleAttributeChange = (attributeId, valueId) => {
    setSelectedAttributeValues((prev) => ({
      ...prev,
      [attributeId]: Number(valueId),
    }));
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#191c1e]">Tour không tìm thấy</h2>
          <Link to="/tours" className="text-[#003974] hover:underline mt-2 block">Quay về danh sách tour</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px]">
        {tour.image ? (
          <img src={tour.image} alt={tour.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#003974] to-[#00509d]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <Link to="/tours" className="absolute top-24 left-4 md:left-8 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span><span className="hidden sm:inline">Quay lại</span>
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="container-main">
            <p className="label-caps text-[#a4c5ff] mb-2">{tour.destination}</p>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{tour.name}</h1>
            {tour.quotationDescription && (
              <p className="text-xl mb-4 text-white/80">{tour.quotationDescription}</p>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined">schedule</span>{tour.duration}</span>
                <span className="flex items-center gap-1">
                  {generateStarRating(tour.rating).map((star, idx) => (
                    <span key={idx} className="material-symbols-outlined text-[#fe9400] text-sm">{star === 'full' ? 'star' : star === 'half' ? 'star_half' : 'star_border'}</span>
                  ))}
                  {tour.rating} ({tour.reviewCount} nhận xét)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined">location_on</span>{tour.destination}</span>
                {tour.locationMapUrl && (
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="text-sm font-semibold text-[#003974] hover:underline"
                  >
                    xem chi tiết
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-main py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Detail Information */}
            <section className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow">
              <h2 className="text-2xl font-bold text-[#191c1e] mb-6">Thông Tin Chi Tiết</h2>
              {tour.detailInformation ? (
                <div
                  className="text-[#424751] leading-relaxed [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#191c1e] [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#191c1e] [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#191c1e] [&_h4]:mb-3 [&_h4]:mt-5 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-[#191c1e] [&_p]:mb-4 [&_p]:whitespace-pre-line [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_img]:my-6 [&_img]:w-full [&_img]:rounded-2xl [&_img]:object-cover [&_figure]:my-6 [&_figure]:overflow-hidden [&_figure]:rounded-2xl [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_tbody_tr:nth-child(even)]:bg-[#f7f9fb] [&_td]:border [&_td]:border-[#e0e3e5] [&_td]:p-3 [&_th]:border [&_th]:border-[#e0e3e5] [&_th]:bg-[#f2f4f6] [&_th]:p-3 [&_th]:text-left [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#00509d] [&_blockquote]:bg-[#f7f9fb] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_a]:font-semibold [&_a]:text-[#00509d] [&_a]:underline [&_iframe]:my-6 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-2xl"
                  dangerouslySetInnerHTML={{ __html: tour.detailInformation }}
                />
              ) : (
                <p className="text-[#424751]">Sản phẩm này chưa có nội dung Detail Information.</p>
              )}
            </section>


          </div>

          {/* Booking Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 editorial-shadow sticky top-24">
              <div className="mb-4">
                <p className="text-sm text-[#424751]">Giá từ</p>
                <p className="text-3xl font-bold text-[#003974]">{formatPrice(displayedPrice)}<span className="text-base font-normal text-[#424751]"> / khách</span></p>
              </div>

              {!tour.isCombo && variantAttributes.length > 0 && (
                <div className="mb-5 space-y-3 rounded-xl border border-[#e0e3e5] p-4">
                  <p className="text-sm font-semibold text-[#191c1e]">Chọn Chi Tiết Sản Dịch Vụ</p>
                  {variantAttributes.map((attribute) => {
                    const options = attribute.values || [];
                    const selected = selectedAttributeValues[attribute.attribute_id] || options[0]?.id || '';
                    return (
                      <div key={attribute.attribute_id}>
                        <label className="mb-1 block text-xs font-medium text-[#424751]">{attribute.attribute_name}</label>
                        <select
                          className="input-ghost"
                          value={selected}
                          onChange={(e) => handleAttributeChange(attribute.attribute_id, e.target.value)}
                        >
                          {options.map((option) => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {tour.badge && <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#fe9400] text-white rounded-full mb-4">{tour.badge}</span>}
              <Button variant="secondary" size="xl" fullWidth onClick={handleBookNow}>Đặt Ngay</Button>
              <div className="mt-6 pt-6 border-t border-[#e0e3e5]">
                <p className="text-sm text-[#424751] mb-2">Hoặc liên hệ tư vấn:</p>
                <div className="flex items-center gap-2 text-[#003974]"><span className="material-symbols-outlined">call</span><span className="font-semibold">1900 6868</span></div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Tours */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#003974] mb-6">Các Hành Trình Tương Tự</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {[
              { id: 2, name: 'Sa Pa: Bản Tình Ca Ruộng Bậc Thang', duration: '4 Ngày', price: '8.200.000₫', image: 'https://images.unsplash.com/photo-1552831388-6a2fba73c4c1?w=400&q=80' },
              { id: 3, name: 'Maldives: Thiên Đường Nhiệt Đới', duration: '5 Ngày', price: '45.000.000₫', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80' },
              { id: 7, name: 'Đà Lạt: Thành Phố Ngàn Hoa', duration: '3 Ngày', price: '4.500.000₫', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80' },
            ].map((related) => (
              <Link key={related.id} to={`/tour/${related.id}`} className="flex-shrink-0 w-64 card">
                <div className="aspect-[4/3] overflow-hidden rounded-t-xl"><img src={related.image} alt={related.name} className="w-full h-full object-cover" /></div>
                <div className="p-3"><h4 className="font-semibold text-sm text-[#191c1e] line-clamp-2">{related.name}</h4><p className="text-xs text-[#424751] mt-1">{related.duration} | {related.price}</p></div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      <Modal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} title="Xác Nhận Đặt Tour" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-[#f2f4f6] rounded-xl">
            <img src={tour.image} alt={tour.name} className="w-full h-32 object-cover rounded-lg mb-3" />
            <h3 className="font-bold text-[#191c1e]">{tour.name}</h3>
            <p className="text-sm text-[#424751]">{tour.duration} | {tour.destination}</p>
            <p className="text-lg font-bold text-[#003974] mt-2">{formatPrice(displayedPrice)} / khách</p>
          </div>
          <p className="text-sm text-[#424751]">Bạn sẽ được chuyển đến trang thanh toán để hoàn tất đặt tour.</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowBookingModal(false)}>Hủy</Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/booking', {
                state: {
                  productId: tour.id,
                  productName: tour.name,
                  productPrice: displayedPrice,
                  variantId: selectedVariantId,
                  isCombo: tour.isCombo,
                  isComboMultipleChoice: tour.isComboMultipleChoice,
                  isDayTour: tour.isDayTour,
                },
              })}
            >
              Tiếp Tục
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showMapModal} onClose={() => setShowMapModal(false)} title="Bản đồ địa chỉ" size="xl">
        <div className="space-y-4">
          {tour.locationAddress && (
            <p className="text-sm text-[#424751]">
              Địa chỉ: <span className="font-semibold text-[#191c1e]">{tour.locationAddress}</span>
            </p>
          )}
          <div className="overflow-hidden rounded-2xl border border-[#e0e3e5]">
            <iframe
              title="Google Maps"
              src={buildGoogleMapsEmbedUrl(tour.locationMapUrl, tour.locationAddress)}
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#6b7280]">Bạn có thể zoom bằng Ctrl + cuộn chuột hoặc các nút +/- trên bản đồ.</p>
            <a
              href={tour.locationMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tour.locationAddress || '')}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-lg bg-[#003974] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002f5f]"
            >
              Mở Google Maps
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TourDetailPage;
