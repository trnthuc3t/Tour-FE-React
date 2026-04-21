import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchForm, DestinationCard, Button } from '../components';
import { productService } from '../services/productService';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({ limit: 4, offset: 0 });
        const mapped = (data.products || []).map(p => ({
          id: p.id,
          name: p.name,
          destination: p.destination || 'Việt Nam',
          duration: p.duration || '3 Ngày 2 Đêm',
          rating: p.rating || 4.5,
          reviewCount: p.reviewCount || 0,
          price: p.list_price || 0,
          badge: p.badge || '',
          badgeType: p.badgeType || 'primary',
          image: p.image_url || '',
        }));
        setFeaturedProducts(mapped);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const destinations = [
    { id: 'dest-1', name: 'Việt Nam', location: 'Vịnh Hạ Long', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', tourCount: 24 },
    { id: 'dest-2', name: 'Nhật Bản', location: 'Kyoto', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80', tourCount: 18 },
    { id: 'dest-3', name: 'Indonesia', location: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tourCount: 15 },
    { id: 'dest-4', name: 'Maldives', location: 'Malé', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80', tourCount: 8 },
  ];

  const whyUsItems = [
    { icon: 'verified_user', title: 'An Tâm Tuyệt Đối', description: 'Bảo hiểm du lịch toàn diện và hỗ trợ 24/7 trong suốt hành trình.' },
    { icon: 'workspace_premium', title: 'Dịch Vụ Đẳng Cấp', description: 'Đối tác là các khách sạn, resort và hãng hàng không hàng đầu.' },
    { icon: 'edit_calendar', title: 'Lịch Trình Tùy Chỉnh', description: 'Thiết kế hành trình riêng biệt theo sở thích và ngân sách của bạn.' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#003974]/60 via-[#003974]/40 to-[#003974]/80" />
        </div>

        <div className="relative z-10 container-main text-center text-white">
          <p className="label-caps text-[#a4c5ff] mb-4">The Horizon Editorial</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
            KHÁM PHÁ THẾ GIỚI<br />
            <span className="text-[#fe9400]">THEO CÁCH CỦA BẠN</span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-light mb-8 text-white/90">Hành Trình Độc Bản.</h2>

          <div className="max-w-3xl mx-auto">
            <SearchForm variant="hero" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12">
            <div><p className="text-3xl md:text-4xl font-bold">10K+</p><p className="text-sm text-white/70">Tour Du Lịch</p></div>
            <div><p className="text-3xl md:text-4xl font-bold">50+</p><p className="text-sm text-white/70">Điểm Đến</p></div>
            <div><p className="text-3xl md:text-4xl font-bold">25K+</p><p className="text-sm text-white/70">Khách Hàng</p></div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="material-symbols-outlined text-white text-3xl">keyboard_arrow_down</span>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="section-padding-lg bg-[#f7f9fb]">
        <div className="container-main">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-caps mb-2">Khám Phá</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#003974]">Điểm Đến Hàng Đầu</h2>
            </div>
            <Link to="/tours" className="hidden md:flex items-center gap-1 text-[#003974] font-semibold hover:gap-2 transition-all">
              Xem tất cả<span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} variant={dest.id === 'dest-1' ? 'large' : 'default'} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/tours"><Button variant="outline">Xem tất cả điểm đến</Button></Link>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="section-padding-lg bg-[#eceef0]">
        <div className="container-main">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-caps mb-2">Đề Xuất</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#003974]">Trải Nghiệm Nổi Bật</h2>
            </div>
            <Link to="/tours" className="hidden md:flex items-center gap-1 text-[#003974] font-semibold hover:gap-2 transition-all">
              Xem tất cả<span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">Đang tải...</div>
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[#424751]">Chưa có sản phẩm nào</div>
            ) : (
              featuredProducts.map((product) => {
                const badgeColors = { primary: 'bg-[#00509d] text-white', secondary: 'bg-[#fe9400] text-white', success: 'bg-[#b3ebff] text-[#001f27]' };
                return (
                  <Link key={product.id} to={`/product/${product.id}`} className="card group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-[#eceef0] flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-[#c2c6d3]">image</span>
                        </div>
                      )}
                      {product.badge && (
                        <span className="absolute top-3 left-3 badge">{product.badge}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="label-caps mb-2">{product.destination}</p>
                      <h3 className="font-semibold text-[#191c1e] mb-2 line-clamp-2 group-hover:text-[#003974] transition-colors">{product.name}</h3>
                      <div className="flex items-center justify-between pt-3 border-t border-[#e0e3e5]">
                        <div>
                          <span className="text-xs text-[#424751]">Giá từ</span>
                          <p className="text-lg font-bold text-[#003974]">
                            {new Intl.NumberFormat('vi-VN').format(product.price)}đ<span className="text-xs font-normal text-[#424751]"> / khách</span>
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-[#003974] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding-lg bg-[#f7f9fb]">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="label-caps mb-2">Vì Sao Chọn Chúng Tôi</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#003974]">Trải Nghiệm Du Lịch Khác Biệt</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyUsItems.map((item, idx) => (
              <div key={idx} className="text-center p-8 bg-[#eceef0] rounded-2xl hover:bg-[#f2f4f6] transition-colors">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full hero-gradient flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-[#191c1e] mb-3">{item.title}</h3>
                <p className="text-[#424751] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding hero-gradient">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nhận Ưu Đãi Đặc Biệt</h2>
            <p className="text-white/80 mb-8">Đăng ký nhận bản tin để cập nhật những ưu đãi hấp dẫn và tin tức du lịch mới nhất.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Nhập email của bạn" className="flex-1 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/50" />
              <button type="submit" className="px-8 py-3 bg-white text-[#003974] font-semibold rounded-xl hover:bg-white/90 transition-colors">Đăng Ký</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
