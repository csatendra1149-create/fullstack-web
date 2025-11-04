import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject({
      success: false,
      message: 'Network error. Please check your connection.'
    });
  }
);

// ========== AUTH ENDPOINTS ==========

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ========== USER ENDPOINTS ==========

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addAddress: (data) => api.post('/users/address', data),
  updateAddress: (id, data) => api.put(`/users/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
  setDefaultAddress: (id) => api.put(`/users/address/${id}/default`),
};

// ========== MEAL ENDPOINTS ==========

export const mealAPI = {
  getAllMeals: (params) => api.get('/meals', { params }),
  getMealById: (id) => api.get(`/meals/${id}`),
  searchMeals: (query) => api.get(`/meals/search?q=${query}`),
  createMeal: (data) => api.post('/meals', data),
  updateMeal: (id, data) => api.put(`/meals/${id}`, data),
  deleteMeal: (id) => api.delete(`/meals/${id}`),
  uploadMealImages: (id, formData) => api.post(`/meals/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addReview: (id, data) => api.post(`/meals/${id}/review`, data),
  getMealsByKitchen: (kitchenId) => api.get(`/meals/kitchen/${kitchenId}`),
};

// ========== ORDER ENDPOINTS ==========

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getUserOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  rateOrder: (id, data) => api.post(`/orders/${id}/rate`, data),
  getKitchenOrders: () => api.get('/orders/kitchen'),
  trackOrder: (id) => api.get(`/orders/${id}/track`),
};

// ========== DELIVERY ENDPOINTS ==========

export const deliveryAPI = {
  getAvailableOrders: (params) => api.get('/delivery/available-orders', { params }),
  acceptDelivery: (orderId) => api.post(`/delivery/accept/${orderId}`),
  updateLocation: (location) => api.put('/delivery/update-location', location),
  completeDelivery: (orderId, data) => api.post(`/delivery/complete/${orderId}`, data),
  getActiveDeliveries: () => api.get('/delivery/active'),
  getDeliveryHistory: (params) => api.get('/delivery/history', { params }),
  getEarnings: (params) => api.get('/delivery/earnings', { params }),
};

// ========== CITY ENDPOINTS ==========

export const cityAPI = {
  getAllCities: () => api.get('/cities'),
  getCityById: (id) => api.get(`/cities/${id}`),
  requestCity: (data) => api.post('/cities/request', data),
  getAreasInCity: (cityId) => api.get(`/cities/${cityId}/areas`),
};

// ========== NOTIFICATION ENDPOINTS ==========

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// ========== PAYMENT ENDPOINTS ==========

export const paymentAPI = {
  createPaymentIntent: (amount) => api.post('/payments/create-intent', { amount }),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
};

// Helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setUserData = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUserData = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

export default api;