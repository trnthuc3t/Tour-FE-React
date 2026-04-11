import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tourReducer from './tourSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tours: tourReducer,
  },
});

export default store;
