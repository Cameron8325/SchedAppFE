// src/services/authService.js

import axios from 'axios';

// Helper function to get the CSRF token from the cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Ensure axios sends cookies with requests
axios.defaults.withCredentials = true;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/users/';

// Initialize CSRF token by hitting the set-csrf endpoint
const initializeCsrf = async () => {
    try {
        await axios.get(`${API_URL}set-csrf/`);
    } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
    }
};

// Call initializeCsrf when the app starts
initializeCsrf();

// Register function
const register = async (username, firstName, lastName, email, password, passwordConfirm, phoneNumber) => {
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await axios.post(`${API_URL}register/`, {
            username,
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            password_confirm: passwordConfirm,
            phone_number: phoneNumber,
        }, {
            headers: {
                'X-CSRFToken': csrfToken
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Login function
const login = async (username_email, password) => {
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await axios.post(`${API_URL}login/`, {
            username_email,
            password
        }, {
            headers: {
                'X-CSRFToken': csrfToken
            },
            withCredentials: true
        });
        // Initialize CSRF token after login
        await initializeCsrf();
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Logout function
const logout = async () => {
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await axios.post(`${API_URL}logout/`, {}, {
            headers: {
                'X-CSRFToken': csrfToken
            },
            withCredentials: true
        });
        // Initialize CSRF token after logout
        await initializeCsrf();
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Get current user
const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${API_URL}check-user/`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.response && error.response.status === 401) {
            // User is not authenticated
            return null;
        }
        throw error;
    }
};

// Check if the user is a superuser
const isSuperUser = async () => {
    try {
        const response = await axios.get(`${API_URL}check-superuser/`, {
            withCredentials: true
        });
        return response.data.is_superuser;
    } catch (error) {
        console.error('Error checking superuser status:', error);
        if (error.response && error.response.status === 401) {
            // User is not authenticated
            return false;
        }
        throw error;
    }
};

// Refresh token function to handle 401 responses
const refreshToken = async () => {
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await axios.post(`${API_URL}token/refresh/`, {}, {
            headers: {
                'X-CSRFToken': csrfToken
            },
            withCredentials: true
        });
        await initializeCsrf(); // Reinitialize CSRF token after refresh
        return response.data;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
};

axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
  
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Set the retry flag
        try {
          await refreshToken(); // Try to refresh the token
  
          // Retry the original request with the updated config
          return axios(originalRequest);
        } catch (refreshError) {
          // If token refresh fails, logout the user or handle accordingly
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    isSuperUser,
    refreshToken,
};

export default authService;
