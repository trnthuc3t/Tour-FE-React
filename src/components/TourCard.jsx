import { Link } from 'react-router-dom';
import { formatPrice, generateStarRating } from '../utils';

const TourCard = ({ tour, variant = 'default' }) => {
  const { id, name, destination, duration, rating, reviewCount, price, badge, badgeType, image } = tour;

  const badgeColors = {
    primary: 'bg-[#00509d] text-white',
    secondary: 'bg-[#fe9400] text-white',
    success: 'bg-[#b3ebff] text-[#001f27]',
  };

  return (
    <Link to={`/tour/${id}`} className={`card group block ${variant === 'featured' ? 'bg-[#eceef0]' : ''}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {badge && (
          <span className={`absolute top-3 left-3 badge ${badgeColors[badgeType] || badgeColors.primary}`}>{badge}</span>
        )}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#424751] hover:text-[#ba1a1a] transition-colors" onClick={(e) => e.preventDefault()}>
          <span className="material-symbols-outlined text-lg">favorite_border</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="label-caps mb-2">{destination}</p>
        <h3 className="font-semibold text-[#191c1e] mb-2 line-clamp-2 group-hover:text-[#003974] transition-colors">{name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {generateStarRating(rating).map((star, idx) => (
              <span key={idx} className="material-symbols-outlined text-sm text-[#fe9400]">
                {star === 'full' ? 'star' : star === 'half' ? 'star_half' : 'star_border'}
              </span>
            ))}
          </div>
          <span className="text-sm text-[#424751]">{rating} ({reviewCount} nhận xét)</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-[#424751] mb-3">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">schedule</span>{duration}</span>
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">location_on</span>{destination.split(',')[0]}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e0e3e5]">
          <div>
            <span className="text-xs text-[#424751]">Giá từ</span>
            <p className="text-lg font-bold text-[#003974]">
              {formatPrice(price)}<span className="text-xs font-normal text-[#424751]"> / khách</span>
            </p>
          </div>
          <span className="material-symbols-outlined text-[#003974] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
