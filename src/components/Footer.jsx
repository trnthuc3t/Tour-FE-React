import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Điểm Đến Cao Cấp', path: '/tours' },
    { name: 'Trải Nghiệm Độc Bản', path: '/tours' },
    { name: 'Tạp Chí Du Lịch', path: '/tours' },
    { name: 'Bộ Sưu Tập Video', path: '/tours' },
  ];

  const supportLinks = [
    { name: 'Liên Hệ', path: '/contact' },
    { name: 'Câu Hỏi Thường Gặp', path: '/faq' },
    { name: 'Chính Sách Bảo Mật', path: '/privacy' },
    { name: 'Điều Khoản Dịch Vụ', path: '/terms' },
  ];

  return (
    <footer className="bg-[#eceef0] pt-16 pb-8">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#c2c6d3]">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-[#003974] mb-4">The Horizon Editorial</h3>
            <p className="text-sm text-[#424751] mb-4 leading-relaxed">
              Khám phá thế giới theo cách của bạn. Hành trình độc bản, trải nghiệm tuyệt vời.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#424751] hover:bg-[#003974] hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#424751] hover:bg-[#003974] hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">mail</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#003974] uppercase tracking-wider mb-4">Khám Phá</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-[#424751] hover:text-[#003974] transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#003974] uppercase tracking-wider mb-4">Hỗ Trợ</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-[#424751] hover:text-[#003974] transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-[#003974] uppercase tracking-wider mb-4">Liên Hệ</h4>
            <div className="space-y-3 text-sm text-[#424751]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003974]">call</span>
                <span>1900 6868</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003974]">mail</span>
                <span>contact@horizon.com</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#003974]">location_on</span>
                <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#424751]">© {currentYear} The Horizon Editorial. All rights reserved.</p>
          <div className="flex items-center gap-1 text-sm text-[#424751]">
            <span className="material-symbols-outlined text-lg">headset_mic</span>
            <span>Hỗ trợ 24/7 | 1900 6868</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
