import apiClient from './apiClient';

export const authService = {
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (credentials.email && credentials.password) {
      return {
        data: {
          user: { id: 'user-001', name: 'Khách Hàng Demo', email: credentials.email, avatar: null },
          token: 'demo_token_' + Date.now(),
        },
      };
    }
    throw new Error('Email hoặc mật khẩu không đúng');
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: {
        user: { id: 'user-' + Date.now(), name: userData.fullName, email: userData.email, avatar: null },
        token: 'demo_token_' + Date.now(),
      },
    };
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    return { data: { success: true } };
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    return { data: { user: { id: 'user-001', name: 'Khách Hàng Demo', email: 'demo@horizon.com', avatar: null } } };
  },

  forgotPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true, message: 'Đã gửi liên kết đặt lại mật khẩu' } };
  },
};

export default authService;
