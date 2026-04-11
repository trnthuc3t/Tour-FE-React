import { useState, useEffect } from 'react';
import { TourCard, LoadingSpinner, Input } from '../components';
import { tourService } from '../services/tourService';
import { useDebounce } from '../hooks';

const TourListPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ destination: '', priceMin: 0, priceMax: 50000000, duration: '', rating: 0 });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const params = { destination: debouncedFilters.destination || debouncedSearch, ...debouncedFilters };
        const response = await tourService.getTours(params);
        setTours(response.data.tours);
      } catch (error) {
        console.error('Failed to fetch tours:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [debouncedSearch, debouncedFilters]);

  const durationOptions = [{ label: 'Tất cả', value: '' }, { label: '1-3 ngày', value: '1-3' }, { label: '4-7 ngày', value: '4-7' }, { label: '8+ ngày', value: '8+' }];
  const ratingOptions = [{ label: 'Tất cả', value: 0 }, { label: '4.5+', value: 4.5 }, { label: '4.0+', value: 4.0 }, { label: '3.0+', value: 3.0 }];

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="bg-[#eceef0] pt-24 pb-12">
        <div className="container-main">
          <h1 className="text-3xl md:text-4xl font-bold text-[#003974] mb-2">Khám Phá Các Tour Du Lịch</h1>
          <p className="text-[#424751]">Hơn 128 tour du lịch đang chờ bạn khám phá</p>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-24 editorial-shadow">
              <h3 className="font-bold text-[#191c1e] mb-4">Bộ Lọc</h3>

              <div className="mb-6">
                <Input placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon="search" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#191c1e] mb-2">Điểm Đến</label>
                <select value={filters.destination} onChange={(e) => setFilters({ ...filters, destination: e.target.value })} className="input-ghost">
                  <option value="">Tất cả điểm đến</option>
                  <option value="Việt Nam">Việt Nam</option>
                  <option value="Nhật Bản">Nhật Bản</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Maldives">Maldives</option>
                  <option value="Na Uy">Na Uy</option>
                  <option value="Ý">Ý</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#191c1e] mb-2">Mức Giá</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Từ" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) })} className="input-ghost text-sm" />
                  <span className="text-[#424751]">-</span>
                  <input type="number" placeholder="Đến" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })} className="input-ghost text-sm" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#191c1e] mb-2">Thời Gian</label>
                <div className="flex flex-wrap gap-2">
                  {durationOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setFilters({ ...filters, duration: opt.value })} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${filters.duration === opt.value ? 'bg-[#003974] text-white' : 'bg-[#f2f4f6] text-[#424751] hover:bg-[#eceef0]'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#191c1e] mb-2">Đánh Giá</label>
                <div className="flex flex-wrap gap-2">
                  {ratingOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setFilters({ ...filters, rating: opt.value })} className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${filters.rating === opt.value ? 'bg-[#003974] text-white' : 'bg-[#f2f4f6] text-[#424751] hover:bg-[#eceef0]'}`}>
                      {opt.value > 0 && <span className="material-symbols-outlined text-sm">star</span>}{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => { setFilters({ destination: '', priceMin: 0, priceMax: 50000000, duration: '', rating: 0 }); setSearchQuery(''); }} className="w-full py-2 text-sm text-[#003974] font-semibold hover:bg-[#f2f4f6] rounded-lg transition-colors">Đặt Lại Bộ Lọc</button>
            </div>
          </aside>

          {/* Tour Grid */}
          <main className="flex-1">
            {loading ? (
              <LoadingSpinner fullScreen />
            ) : tours.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-[#c2c6d3]">search_off</span>
                <h3 className="text-xl font-bold text-[#191c1e] mt-4">Không tìm thấy tour</h3>
                <p className="text-[#424751] mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#424751] mb-4">Tìm thấy <span className="font-semibold">{tours.length}</span> tour</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
                </div>
                <div className="flex justify-center mt-12 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((page) => (
                    <button key={page} className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === 1 ? 'bg-[#003974] text-white' : 'bg-white text-[#424751] hover:bg-[#f2f4f6]'}`}>{page}</button>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TourListPage;
