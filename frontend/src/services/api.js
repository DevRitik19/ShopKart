import axios from 'axios';

// Base axios instance — all requests go to the backend at port 5000
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,          // send / receive HttpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' },
});

// ─── Customer API ─────────────────────────────────────────────────────────────

/** POST /customers/register */
export const registerCustomer = (data) => api.post('/customers/register', data);

/** POST /customers/login */
export const loginCustomer = (data) => api.post('/customers/login', data);

/** GET /customers/me  (protected – requires valid cookie) */
export const getMyProfile = () => api.get('/customers/me');

/** POST /customers/logout  (protected) */
export const logoutCustomer = () => api.post('/customers/logout');

export default api;