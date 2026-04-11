const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };

  const spinner = (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-[#e0e3e5]"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#003974] animate-spin"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm text-[#424751]">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};

export default LoadingSpinner;
