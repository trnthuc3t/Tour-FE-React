import { Link } from 'react-router-dom';

const Button = ({ children, variant = 'primary', size = 'md', to, href, onClick, disabled = false, loading = false, fullWidth = false, className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'btn-gradient rounded-full hover:opacity-90 focus:ring-[#003974]',
    secondary: 'btn-secondary rounded-full hover:opacity-90 focus:ring-[#fe9400]',
    outline: 'border-2 border-[#003974] text-[#003974] rounded-full hover:bg-[#003974] hover:text-white focus:ring-[#003974]',
    ghost: 'text-[#424751] hover:text-[#003974] hover:bg-[#f2f4f6] rounded-lg',
    text: 'text-[#003974] hover:underline',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-4 text-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  const fullWidthClasses = fullWidth ? 'w-full' : '';
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? disabledClasses : ''} ${fullWidthClasses} ${className}`;

  if (to) {
    return <Link to={to} className={classes} {...props}>{loading ? <span className="flex items-center gap-2"><span className="animate-spin material-symbols-outlined">progress_activity</span>Đang xử lý...</span> : children}</Link>;
  }

  if (href) {
    return <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  }

  return (
    <button className={classes} onClick={onClick} disabled={disabled || loading} {...props}>
      {loading ? <span className="flex items-center gap-2"><span className="animate-spin material-symbols-outlined">progress_activity</span>Đang xử lý...</span> : children}
    </button>
  );
};

export default Button;
