import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthContext();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Điểm Đến', path: '/tours' },
    { name: 'Trải Nghiệm', path: '/tours' },
    { name: 'Tạp Chí', path: '/tours' },
    { name: 'Giới Thiệu', path: '/tours' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav shadow-sm' : 'bg-transparent'}`}>
      <nav className="container-main">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-bold text-[#003974]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              The Terra Tour
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-sm font-medium text-[#424751] hover:text-[#003974] transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button className="w-10 h-10 rounded-full bg-[#003974] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 border-b border-[#e0e3e5]">
                      <p className="font-semibold text-[#191c1e]">{user?.name}</p>
                      <p className="text-xs text-[#424751]">{user?.email}</p>
                    </div>
                    <button onClick={() => navigate('/chatbot')} className="w-full px-4 py-2 text-left text-sm text-[#424751] hover:bg-[#f2f4f6] transition-colors">
                      Chat Bot
                    </button>
                    <button onClick={() => navigate('/orders/history')} className="w-full px-4 py-2 text-left text-sm text-[#424751] hover:bg-[#f2f4f6] transition-colors">
                      Lịch Sử Mua Hàng
                    </button>
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-[#ba1a1a] hover:bg-[#f2f4f6] transition-colors">
                      Đăng Xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-[#424751] hover:text-[#003974] transition-colors">
                  Đăng Nhập
                </Link>
                <Link to="/register" className="hidden md:flex px-4 py-2 text-sm font-semibold text-white rounded-full btn-gradient">
                  Đặt Ngay
                </Link>
              </div>
            )}

            <button className="md:hidden p-2 text-[#424751]" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-[#e0e3e5] bg-white rounded-b-2xl">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="block px-4 py-3 text-[#424751] hover:bg-[#f2f4f6] transition-colors" onClick={() => setMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link to="/chatbot" className="block px-4 py-3 text-[#424751] hover:bg-[#f2f4f6]" onClick={() => setMenuOpen(false)}>
                  Chat Bot
                </Link>
                <Link to="/orders/history" className="block px-4 py-3 text-[#424751] hover:bg-[#f2f4f6]" onClick={() => setMenuOpen(false)}>
                  Lịch Sử Mua Hàng
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block px-4 py-3 text-[#424751] hover:bg-[#f2f4f6]" onClick={() => setMenuOpen(false)}>Đăng Nhập</Link>
                <Link to="/register" className="block px-4 py-3 text-[#003974] font-semibold hover:bg-[#f2f4f6]" onClick={() => setMenuOpen(false)}>Đăng Ký</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
