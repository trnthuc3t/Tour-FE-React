import { Outlet, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#f7f9fb]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80" alt="Travel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#003974]/80 to-[#00509d]/60" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-4xl font-bold mb-2">The Horizon Editorial</h1>
            <p className="text-white/80">Khám phá thế giới theo cách của bạn</p>
          </div>
          <div className="space-y-6">
            <blockquote className="text-2xl font-light italic leading-relaxed">
              "Du lịch là khoản đầu tư tốt nhất bạn có thể làm cho bản thân."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined">flight</span>
              </div>
              <div>
                <p className="font-semibold">Hơn 10,000+ Tour</p>
                <p className="text-sm text-white/70">Điểm đến trên toàn thế giới</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} The Horizon Editorial</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-[#003974]">The Horizon Editorial</h1>
            <p className="text-sm text-[#424751] mt-1">Khám phá thế giới theo cách của bạn</p>
          </div>
          <Outlet />
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-[#424751] hover:text-[#003974] transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
