import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout, selectAuth } from '../store/authSlice';
import authService from '../services/authService';

/**
 * Custom hook to manage authentication
 * @returns {Object} - Auth state and actions
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector(selectAuth);

  const login = async (credentials) => {
    dispatch(loginStart());
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);
      dispatch(loginSuccess(user));
      return { success: true };
    } catch (error) {
      dispatch(loginFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  const logoutUser = async () => {
    try { await authService.logout(); }
    finally { localStorage.removeItem('auth_token'); dispatch(logout()); }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    login,
    logout: logoutUser,
  };
};

export default useAuth;
