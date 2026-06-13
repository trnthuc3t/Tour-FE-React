import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = ({ variant = 'hero', onSearch }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    keyword: '',
    priceMin: '',
    priceMax: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(formData);
    } else {
      const params = new URLSearchParams();
      if (formData.keyword) params.append('search', formData.keyword);
      if (formData.priceMin) params.append('priceMin', formData.priceMin);
      if (formData.priceMax) params.append('priceMax', formData.priceMax);
      navigate(`/tours?${params.toString()}`);
    }
  };

  const handleBudgetChange = (val) => {
    if (!val) {
      setFormData(prev => ({ ...prev, priceMin: '', priceMax: '' }));
      return;
    }
    const [min, max] = val.split('-');
    setFormData(prev => ({ ...prev, priceMin: min, priceMax: max }));
  };

  const getBudgetValue = () => {
    if (!formData.priceMin && !formData.priceMax) return '';
    return `${formData.priceMin}-${formData.priceMax}`;
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-full p-1.5 pl-4 pr-1.5 shadow-md border border-[#e0e3e5] hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003974] text-lg">location_on</span>
          <input 
            type="text" 
            placeholder="Bạn muốn đi đâu?" 
            value={formData.keyword} 
            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })} 
            className="outline-none border-none text-xs bg-transparent w-28 md:w-36 font-medium placeholder-gray-400 focus:ring-0 p-0" 
          />
        </div>
        <button type="submit" className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-white text-base">search</span>
        </button>
      </form>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="backdrop-blur-xl bg-white/80 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-3xl md:rounded-full p-3 md:pl-8 md:pr-3 flex flex-col md:flex-row items-center gap-4 md:gap-2 max-w-3xl mx-auto transition-all duration-300 hover:bg-white/90 focus-within:bg-white/95 focus-within:shadow-[0_20px_50px_rgba(0,57,116,0.15)]"
    >
      {/* Section 1: Keyword/Destination */}
      <div className="flex-1 w-full flex items-center gap-3.5 px-1">
        <span className="material-symbols-outlined text-[#003974] bg-[#003974]/5 p-2.5 rounded-full flex-shrink-0">
          explore
        </span>
        <div className="flex-1 text-left">
          <label className="block text-[10px] font-bold text-[#003974]/80 uppercase tracking-widest mb-0.5">
            Điểm đến
          </label>
          <input 
            type="text" 
            placeholder="Bạn muốn đi đâu?" 
            value={formData.keyword} 
            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })} 
            className="w-full bg-transparent border-0 outline-none text-sm text-[#191c1e] placeholder-gray-400 font-semibold focus:ring-0 p-0" 
          />
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden md:block w-px h-10 bg-[#e0e3e5] mx-3" />

      {/* Section 2: Budget selection */}
      <div className="w-full md:w-60 flex items-center gap-3.5 px-1 relative">
        <span className="material-symbols-outlined text-[#fe9400] bg-[#fe9400]/10 p-2.5 rounded-full flex-shrink-0">
          payments
        </span>
        <div className="flex-1 text-left pr-4">
          <label className="block text-[10px] font-bold text-[#003974]/80 uppercase tracking-widest mb-0.5">
            Ngân sách
          </label>
          <select 
            value={getBudgetValue()} 
            onChange={(e) => handleBudgetChange(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-sm text-[#191c1e] placeholder-gray-400 font-semibold focus:ring-0 p-0 cursor-pointer appearance-none pr-6"
          >
            <option value="">Tất cả mức giá</option>
            <option value="0-1000000">Dưới 1 triệu</option>
            <option value="1000000-3000000">1 - 3 triệu</option>
            <option value="3000000-5000000">3 - 5 triệu</option>
            <option value="5000000-10000000">5 - 10 triệu</option>
            <option value="10000000-">Trên 10 triệu</option>
          </select>
        </div>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[#424751] text-lg">
          keyboard_arrow_down
        </span>
      </div>

      {/* Search Button */}
      <button 
        type="submit" 
        className="w-full md:w-auto px-8 py-4 hero-gradient text-white rounded-2xl md:rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#003974]/20 hover:shadow-xl hover:shadow-[#003974]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
      >
        <span className="material-symbols-outlined text-white text-lg">search</span>
        Tìm Kiếm
      </button>
    </form>
  );
};

export default SearchForm;
