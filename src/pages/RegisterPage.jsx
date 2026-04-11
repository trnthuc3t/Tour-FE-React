import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Button, Input } from '../components';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', agreeTerms: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Họ và tên không được để trống';
    if (!formData.email) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.phone) newErrors.phone = 'Số điện thoại không được để trống';
    else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    else if (formData.password.length < 8) newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Bạn cần đồng ý với điều khoản sử dụng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await login({ email: formData.email, password: formData.password });
      navigate('/');
    } catch (error) {
      setErrors({ general: 'Đăng ký thất bại. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] mb-2">Bắt đầu hành trình mới</h2>
      <p className="text-[#424751] mb-8">Tạo tài khoản để khám phá những ưu đãi đặc biệt</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl text-sm">{errors.general}</div>}
        <Input label="Họ và tên" type="text" name="fullName" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleChange} error={errors.fullName} icon="person" />
        <Input label="Email" type="email" name="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} error={errors.email} icon="mail" />
        <Input label="Số điện thoại" type="tel" name="phone" placeholder="0912 345 678" value={formData.phone} onChange={handleChange} error={errors.phone} icon="call" />
        <Input label="Mật khẩu" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} error={errors.password} icon="lock" helperText="Ít nhất 8 ký tự, bao gồm chữ hoa và số" />
        <Input label="Xác nhận mật khẩu" type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon="lock" />

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="mt-1 w-4 h-4 rounded border-[#c2c6d3] text-[#003974] focus:ring-[#003974]" />
          <span className="text-sm text-[#424751]">
            Tôi đồng ý với <Link to="/terms" className="text-[#003974] hover:underline">Điều khoản sử dụng</Link> và <Link to="/privacy" className="text-[#003974] hover:underline">Chính sách bảo mật</Link>
          </span>
        </label>
        {errors.agreeTerms && <p className="text-sm text-[#ba1a1a] -mt-2">{errors.agreeTerms}</p>}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>Đăng Ký Tài Khoản</Button>
      </form>

      <p className="mt-6 text-center text-[#424751]">
        Đã có tài khoản? <Link to="/login" className="text-[#003974] font-semibold hover:underline">Đăng nhập ngay</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
