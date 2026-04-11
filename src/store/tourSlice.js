import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tourService } from '../services/tourService';

export const fetchTours = createAsyncThunk(
  'tours/fetchTours',
  async (filters = {}) => {
    const response = await tourService.getTours(filters);
    return response.data;
  }
);

export const fetchTourById = createAsyncThunk(
  'tours/fetchTourById',
  async (id) => {
    const response = await tourService.getTourById(id);
    return response.data;
  }
);

export const searchTours = createAsyncThunk(
  'tours/searchTours',
  async (query) => {
    const response = await tourService.searchTours(query);
    return response.data;
  }
);

const initialState = {
  list: [],
  currentTour: null,
  filteredList: [],
  loading: false,
  error: null,
  filters: {
    destination: '',
    priceMin: 0,
    priceMax: 50000000,
    duration: '',
    rating: 0,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
};

const tourSlice = createSlice({
  name: 'tours',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentTour: (state, action) => {
      state.currentTour = action.payload;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTours.pending, (state) => { state.loading = true; })
      .addCase(fetchTours.fulfilled, (state, action) => {
        state.list = action.payload.tours;
        state.loading = false;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTourById.pending, (state) => { state.loading = true; })
      .addCase(fetchTourById.fulfilled, (state, action) => {
        state.currentTour = action.payload;
        state.loading = false;
      })
      .addCase(fetchTourById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(searchTours.fulfilled, (state, action) => {
        state.filteredList = action.payload;
      });
  },
});

export const { setFilters, resetFilters, setCurrentTour, setPage } = tourSlice.actions;
export const selectTours = (state) => state.tours.list;
export const selectCurrentTour = (state) => state.tours.currentTour;
export const selectToursLoading = (state) => state.tours.loading;
export const selectFilters = (state) => state.tours.filters;

export default tourSlice.reducer;
