import axios from 'axios';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    // Bearer token
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // CSRF cho POST/PUT/DELETE
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const csrfToken = localStorage.getItem('odoo_csrf_token');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('odoo_session_id');
      localStorage.removeItem('odoo_csrf_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=session_expired';
      }
    }

    const normalizedError = new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Lỗi kết nối server'
    );

    if (error.response?.data) {
      normalizedError.responseData = error.response.data;
    }
    if (error.response?.status) {
      normalizedError.status = error.response.status;
    }
    if (error.response?.data?.error_code) {
      normalizedError.errorCode = error.response.data.error_code;
    }
    if (error.response?.data?.data?.validation_errors) {
      normalizedError.validationErrors = error.response.data.data.validation_errors;
    }

    if (!error.response) {
      normalizedError.message = 'Khong the ket noi den server Odoo. Kiem tra proxy Vite.';
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;