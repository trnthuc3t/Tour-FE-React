/**
 * Format price to VND currency
 * @param {number} price
 * @returns {string}
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format date to Vietnamese format
 * @param {string|Date} date
 * @param {string} locale
 * @returns {string}
 */
export const formatDate = (date, locale = 'vi-VN') => {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format date with time
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ số' };
  }
  return { valid: true, message: 'Mật khẩu hợp lệ' };
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate star rating array
 * @param {number} rating
 * @returns {string[]}
 */
export const generateStarRating = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push('full');
    else if (i === fullStars && hasHalfStar) stars.push('half');
    else stars.push('empty');
  }
  return stars;
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice
 * @param {number} salePrice
 * @returns {number}
 */
export const calculateDiscount = (originalPrice, salePrice) => {
  if (originalPrice <= 0 || salePrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};
