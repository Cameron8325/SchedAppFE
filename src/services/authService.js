import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users/';

const register = (username, firstName, lastName, email, password, passwordConfirm) => {
    return axios.post(API_URL + 'register/', {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirm: passwordConfirm
    });
};

const login = (username_email, password) => {
    return axios.post(API_URL + 'login/', {
        username_email,
        password
    }).then(response => {
        if (response.data.access) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.access);
        }
        return response.data;
    });
};

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const isSuperUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }
    try {
        const response = await axios.get('http://localhost:8000/api/check-superuser/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data.is_superuser;
    } catch (error) {
        console.error('Error checking superuser status:', error);
        return false;
    }
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    isSuperUser
};

export default authService;
