import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TourCard, LoadingSpinner, Input } from '../components';
import { productService } from '../services/productService';
import { useDebounce } from '../hooks';

const TourListPage = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ priceMin: 0, priceMax: 50000000 });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: debouncedSearch,
          limit: 20,
          offset: 0,
        };
        const data = await productService.getProducts(params);
        // Map Odoo product sang format TourCard
        const mapped = (data.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          destination: p.destination || 'Việt Nam',
          duration: p.duration || '3 Ngày 2 Đêm',
          durationDays: p.durationDays || 3,
          rating: p.rating || 4.5,
          reviewCount: p.reviewCount || 0,
          price: p.list_price || 0,
          badge: p.badge || '',
          badgeType: p.badgeType || 'primary',
          image: p.image_url || p.image || '',
        }));

        const filteredByPrice = mapped.filter(
          (product) => product.price >= debouncedFilters.priceMin && product.price <= debouncedFilters.priceMax
        );

        setProducts(filteredByPrice);
        setTotal(filteredByPrice.length);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, debouncedFilters]);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="bg-[#eceef0] pt-24 pb-12">
        <div className="container-main">
          <h1 className="text-3xl md:text-4xl font-bold text-[#003974] mb-2">Khám Phá Các Tour Du Lịch</h1>
          <p className="text-[#424751]">Hơn {total || 0} tour du lịch đang chờ bạn khám phá</p>
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
                <label className="block text-sm font-semibold text-[#191c1e] mb-2">Mức Giá</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Từ" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) })} className="input-ghost text-sm" />
                  <span className="text-[#424751]">-</span>
                  <input type="number" placeholder="Đến" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })} className="input-ghost text-sm" />
                </div>
              </div>

              <button onClick={() => { setFilters({ priceMin: 0, priceMax: 50000000 }); setSearchQuery(''); }} className="w-full py-2 text-sm text-[#003974] font-semibold hover:bg-[#f2f4f6] rounded-lg transition-colors">Đặt Lại Bộ Lọc</button>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <LoadingSpinner fullScreen />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-[#c2c6d3]">search_off</span>
                <h3 className="text-xl font-bold text-[#191c1e] mt-4">Không tìm thấy tour</h3>
                <p className="text-[#424751] mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#424751] mb-4">Tìm thấy <span className="font-semibold">{products.length}</span> tour</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link key={product.id} to={`/tour/${product.id}`} className="card group block">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-[#eceef0] flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-[#c2c6d3]">image</span>
                          </div>
                        )}
                        {product.badge && (
                          <span className="absolute top-3 left-3 badge bg-[#00509d] text-white">{product.badge}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <p className="label-caps mb-2">{product.destination}</p>
                        <h3 className="font-semibold text-[#191c1e] mb-2 line-clamp-2 group-hover:text-[#003974] transition-colors">{product.name}</h3>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#e0e3e5]">
                          <div>
                            <span className="text-xs text-[#424751]">Giá từ</span>
                            <p className="text-lg font-bold text-[#003974]">
                              {new Intl.NumberFormat('vi-VN').format(product.price || 0)}đ<span className="text-xs font-normal text-[#424751]"> / khách</span>
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-[#003974] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                      </div>
                    </Link>
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
