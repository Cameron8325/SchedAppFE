// Centralized axios instance: single API base URL, cookie credentials,
// CSRF header injection, and automatic token refresh on 401.
import axios from 'axios';

const localApiHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? window.location.hostname
    : 'localhost';

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || `http://${localApiHost}:8000`;

export function getCookie(name) {
  if (!document.cookie) return null;
  for (let cookie of document.cookie.split(';')) {
    cookie = cookie.trim();
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Endpoints whose 401s are meaningful and must not trigger a token refresh.
const AUTH_PATHS = [
  '/api/users/login/',
  '/api/users/register/',
  '/api/users/token/refresh/',
  '/api/users/logout/',
];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthPath = AUTH_PATHS.some((path) => original?.url?.includes(path));

    if (status === 401 && original && !original._retry && !isAuthPath) {
      original._retry = true;
      try {
        // The refresh token lives in an HttpOnly cookie; the server reads it
        // and re-sets fresh cookies, so no payload is needed.
        await api.post('/api/users/token/refresh/');
        return api(original);
      } catch (refreshError) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
