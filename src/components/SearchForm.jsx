import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = ({ variant = 'hero', onSearch }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ keyword: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) { onSearch(formData); }
    else { navigate(`/tours?search=${encodeURIComponent(formData.keyword)}`); }
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white rounded-full p-2 shadow-lg">
        <div className="flex items-center gap-2 px-4">
          <span className="material-symbols-outlined text-[#424751]">location_on</span>
          <input type="text" placeholder="Tên tour/dịch vụ..." value={formData.keyword} onChange={(e) => setFormData({ ...formData, keyword: e.target.value })} className="outline-none text-sm bg-transparent w-32" />
        </div>
        <button type="submit" className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center">
          <span className="material-symbols-outlined text-white">search</span>
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 md:p-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      {/* Search by name only */}
      <div className="flex-1">
        <label className="block text-xs font-semibold text-[#003974] uppercase tracking-wider mb-1">Tìm Theo Tên</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#424751]"><span className="material-symbols-outlined">search</span></span>
          <input type="text" placeholder="Nhập tên tour hoặc dịch vụ" value={formData.keyword} onChange={(e) => setFormData({ ...formData, keyword: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-[#f2f4f6] border-0 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003974]/20" />
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className="w-full md:w-auto md:px-8 py-3 btn-gradient rounded-xl font-semibold text-white flex items-center justify-center gap-2">
        <span className="material-symbols-outlined">search</span>
        Tìm Kiếm
      </button>
    </form>
  );
};

export default SearchForm;
