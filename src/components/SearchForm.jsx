import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = ({ variant = 'hero', onSearch }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ location: '', date: '', guests: 1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) { onSearch(formData); }
    else { navigate(`/tours?search=${encodeURIComponent(formData.location)}`); }
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white rounded-full p-2 shadow-lg">
        <div className="flex items-center gap-2 px-4">
          <span className="material-symbols-outlined text-[#424751]">location_on</span>
          <input type="text" placeholder="Điểm đến..." value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="outline-none text-sm bg-transparent w-32" />
        </div>
        <button type="submit" className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center">
          <span className="material-symbols-outlined text-white">search</span>
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 md:p-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      {/* Location */}
      <div className="flex-1">
        <label className="block text-xs font-semibold text-[#003974] uppercase tracking-wider mb-1">Điểm Đến</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#424751]"><span className="material-symbols-outlined">location_on</span></span>
          <input type="text" placeholder="Bạn muốn đến đâu?" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-[#f2f4f6] border-0 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003974]/20" />
        </div>
      </div>

      {/* Date */}
      <div className="flex-1">
        <label className="block text-xs font-semibold text-[#003974] uppercase tracking-wider mb-1">Ngày Khởi Hành</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#424751]"><span className="material-symbols-outlined">calendar_month</span></span>
          <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-[#f2f4f6] border-0 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003974]/20" />
        </div>
      </div>

      {/* Guests */}
      <div className="flex-1">
        <label className="block text-xs font-semibold text-[#003974] uppercase tracking-wider mb-1">Số Khách</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#424751]"><span className="material-symbols-outlined">group</span></span>
          <select value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })} className="w-full pl-10 pr-4 py-3 bg-[#f2f4f6] border-0 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003974]/20 appearance-none">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} Khách</option>)}
          </select>
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
