import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner, Modal } from '../components';
import { tourService } from '../services/tourService';
import { formatPrice, generateStarRating } from '../utils';
import { useAuthContext } from '../context/AuthContext';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);
      try {
        const response = await tourService.getTourById(id);
        setTour(response.data);
        if (response.data.itinerary?.length > 0) setActiveDay(response.data.itinerary[0].day);
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
        <img src={tour.image} alt={tour.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <Link to="/tours" className="absolute top-24 left-4 md:left-8 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span><span className="hidden sm:inline">Quay lại</span>
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="container-main">
            <p className="label-caps text-[#a4c5ff] mb-2">{tour.destination}</p>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{tour.name}</h1>
            <p className="text-xl mb-4 text-white/80">{tour.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined">schedule</span>{tour.duration}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined">location_on</span>{tour.destination}</span>
              <span className="flex items-center gap-1">
                {generateStarRating(tour.rating).map((star, idx) => (
                  <span key={idx} className="material-symbols-outlined text-[#fe9400] text-sm">{star === 'full' ? 'star' : star === 'half' ? 'star_half' : 'star_border'}</span>
                ))}
                {tour.rating} ({tour.reviewCount} nhận xét)
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-main py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow">
              <h2 className="text-2xl font-bold text-[#191c1e] mb-6">Tổng Quan Chuyến Đi</h2>
              <p className="text-[#424751] leading-relaxed mb-6">{tour.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tour.highlights?.map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-[#f2f4f6] rounded-xl">
                    <span className="material-symbols-outlined text-[#003974]">check_circle</span>
                    <span className="text-sm font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            <section className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow">
              <h2 className="text-2xl font-bold text-[#191c1e] mb-6">Lịch Trình Chi Tiết</h2>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tour.itinerary?.map((day) => (
                  <button key={day.day} onClick={() => setActiveDay(day.day)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeDay === day.day ? 'hero-gradient text-white' : 'bg-[#f2f4f6] text-[#424751] hover:bg-[#eceef0]'}`}>Ngày {day.day}</button>
                ))}
              </div>
              {tour.itinerary?.map((day) => (
                <div key={day.day} className={activeDay === day.day ? 'block' : 'hidden'}>
                  <h3 className="text-xl font-bold text-[#191c1e] mb-2">Ngày {day.day}: {day.title}</h3>
                  <p className="text-[#424751] leading-relaxed">{day.description}</p>
                </div>
              ))}
            </section>

            {/* Includes/Excludes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white rounded-2xl p-6 editorial-shadow">
                <h3 className="text-lg font-bold text-[#191c1e] mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#00509d]">check_circle</span>Bao Gồm</h3>
                <ul className="space-y-2">
                  {tour.includes?.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[#424751]"><span className="material-symbols-outlined text-sm text-[#00509d]">check</span>{item}</li>
                  ))}
                </ul>
              </section>
              <section className="bg-white rounded-2xl p-6 editorial-shadow">
                <h3 className="text-lg font-bold text-[#191c1e] mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#ba1a1a]">cancel</span>Không Bao Gồm</h3>
                <ul className="space-y-2">
                  {tour.excludes?.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[#424751]"><span className="material-symbols-outlined text-sm text-[#ba1a1a]">close</span>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Reviews */}
            <section className="bg-white rounded-2xl p-6 md:p-8 editorial-shadow">
              <h2 className="text-2xl font-bold text-[#191c1e] mb-6">Đánh Giá Từ Khách Hàng</h2>
              <div className="space-y-6">
                {tour.reviews?.map((review, idx) => (
                  <div key={idx} className="p-4 bg-[#f2f4f6] rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#003974] text-white flex items-center justify-center font-bold">{review.name.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-[#191c1e]">{review.name}</p>
                        <div className="flex">{[...Array(review.rating)].map((_, i) => <span key={i} className="material-symbols-outlined text-sm text-[#fe9400]">star</span>)}</div>
                      </div>
                    </div>
                    <p className="text-[#424751]">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Booking Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 editorial-shadow sticky top-24">
              <div className="mb-4">
                <p className="text-sm text-[#424751]">Giá từ</p>
                <p className="text-3xl font-bold text-[#003974]">{formatPrice(tour.price)}<span className="text-base font-normal text-[#424751]"> / khách</span></p>
              </div>
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
              <Link key={related.id} to={`/tour/tour-00${related.id}`} className="flex-shrink-0 w-64 card">
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
            <p className="text-lg font-bold text-[#003974] mt-2">{formatPrice(tour.price)} / khách</p>
          </div>
          <p className="text-sm text-[#424751]">Bạn sẽ được chuyển đến trang thanh toán để hoàn tất đặt tour.</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowBookingModal(false)}>Hủy</Button>
            <Button variant="primary" fullWidth onClick={() => navigate('/booking')}>Tiếp Tục</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TourDetailPage;
