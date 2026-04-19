import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,      // Bắt đầu là true để check auth ngay khi mount
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case 'AUTH_LOADING_DONE':
      return { ...state, loading: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}
// Provider

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Kiểm tra auth khi app mount (reload trang)
   * Chỉ gọi khi có token trong localStorage
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        dispatch({ type: 'AUTH_LOADING_DONE' });
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        if (response.code === 200 && response.response?.user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: response.response.user });
        } else {
          // Token không hợp lệ hoặc user không còn
          localStorage.removeItem('auth_token');
          localStorage.removeItem('odoo_session_id');
          localStorage.removeItem('odoo_csrf_token');
          dispatch({ type: 'AUTH_LOADING_DONE' });
        }
      } catch (error) {
        // Token hết hạn hoặc không hợp lệ → clear
        if (error.response?.status === 401 || error.message === 'Not authenticated') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('odoo_session_id');
          localStorage.removeItem('odoo_csrf_token');
        }
        dispatch({ type: 'AUTH_LOADING_DONE' });
      }
    };

    checkAuth();
  }, []);

  /**
   * Đăng nhập
   * @param {Object} credentials { email, password }
   */
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.login(credentials);

      if (response.code === 200 && response.response?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.response.user });
        return response.response.user;
      }

      throw new Error(response.message || 'Dang nhap that bai');
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  }, []);

  /**
   * Dang ky tai khoan moi
   * @param {Object} userData { fullName, email, phone, password, confirmPassword }
   */
  const register = useCallback(async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.register(userData);

      if ((response.code === 200 || response.code === 201) && response.response?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.response.user });
        return response.response.user;
      }

      throw new Error(response.message || 'Dang ky that bai');
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  }, []);

  /**
   * Đăng xuất
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  /**
   * Xóa lỗi auth hiện tại
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return context;
};

export default AuthContext;
