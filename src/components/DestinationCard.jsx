import { Link } from 'react-router-dom';

const DestinationCard = ({ destination, variant = 'default' }) => {
  const { name, location, image, tourCount = 12 } = destination;

  return (
    <Link to={`/tours?destination=${encodeURIComponent(location)}`} className="group relative block overflow-hidden rounded-xl">
      <div className={`relative ${variant === 'large' ? 'aspect-[3/4]' : 'aspect-square'} overflow-hidden`}>
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="label-caps text-[#a4c5ff] mb-1">{name}</p>
          <h3 className="text-white font-semibold text-lg mb-1">{location}</h3>
          <p className="text-white/80 text-sm">{tourCount} tours</p>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
