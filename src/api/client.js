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

const AUTH_SESSION_KEY = 'ceremonial_artifex_auth_session';

export function getAuthSessionState() {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (value === 'active') return true;
  if (value === 'inactive') return false;
  return null;
}

export function setAuthSessionActive(active) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_SESSION_KEY, active ? 'active' : 'inactive');
}

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
  '/api/users/session-status/',
];

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthPath = AUTH_PATHS.some((path) => original?.url?.includes(path));

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthPath &&
      getAuthSessionState() !== false
    ) {
      original._retry = true;
      try {
        // Share one refresh request across all simultaneous 401 responses.
        // This matters because refresh-token rotation invalidates the old token.
        if (!refreshPromise) {
          refreshPromise = api
            .post('/api/users/token/refresh/')
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        setAuthSessionActive(true);
        return api(original);
      } catch (refreshError) {
        setAuthSessionActive(false);
        window.dispatchEvent(new Event('auth:expired'));
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
