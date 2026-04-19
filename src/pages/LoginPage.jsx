import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Button, Input } from '../components';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthContext();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      // Ưu tiên lấy validation error từ API, fallback sang message
      const serverErrors = error.validationErrors || {};
      setErrors({
        ...(serverErrors.email ? { email: serverErrors.email } : {}),
        ...(serverErrors.password ? { password: serverErrors.password } : {}),
        ...(!serverErrors.email && !serverErrors.password
          ? { general: error.message || 'Email hoặc mật khẩu không đúng' }
          : {}),
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] mb-2">Chào mừng trở lại!</h2>
      <p className="text-[#424751] mb-8">Đăng nhập để tiếp tục khám phá thế giới</p>

      {/* Social Login */}
      <div className="space-y-3 mb-6">
        <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#c2c6d3] rounded-xl hover:bg-[#f2f4f6] transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <span className="font-medium text-[#191c1e]">Đăng nhập với Google</span>
        </button>
        <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#166FE5] transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span className="font-medium">Đăng nhập với Facebook</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#c2c6d3]"></div></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 bg-[#f7f9fb] text-[#424751]">hoặc đăng nhập với email</span></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl text-sm">
            {errors.general}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon="mail"
        />
        <Input
          label="Mật khẩu"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon="lock"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#c2c6d3] text-[#003974] focus:ring-[#003974]"
            />
            <span className="text-sm text-[#424751]">Ghi nhớ mật khẩu</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-[#003974] hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Đăng Nhập
        </Button>
      </form>

      <p className="mt-6 text-center text-[#424751]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[#003974] font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
