import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies (JWT)
});

// Response interceptor for handling 401s (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle auto-logout or token refresh here
    }
    return Promise.reject(error);
  }
);

export default api;
