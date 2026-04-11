import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, helperText, icon, iconPosition = 'left', type = 'text', size = 'md', fullWidth = true, className = '', ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const iconPadding = icon ? (iconPosition === 'left' ? 'ps-10' : 'pe-10') : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && <label className="block text-sm font-medium text-[#424751] mb-1.5">{label}</label>}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#424751]">
            <span className="material-symbols-outlined">{icon}</span>
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`input-ghost ${sizeClasses[size]} ${iconPadding} ${error ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/20' : ''}`}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#424751]">
            <span className="material-symbols-outlined">{icon}</span>
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-[#ba1a1a]">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-[#424751]">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
