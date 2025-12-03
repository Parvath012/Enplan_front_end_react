/**
 * Shared API client configuration for user and role services
 * This file eliminates code duplication between userService and roleService
 */
import axios, { AxiosInstance } from 'axios';

/**
 * Creates a configured axios instance with interceptors
 */
export function createApiClient(baseURL?: string): AxiosInstance {
  const API_BASE_URL = baseURL ?? process.env.REACT_APP_USER_MANAGEMENT_API_URL ?? 'http://localhost:8081/api';

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for adding auth token if needed
  apiClient.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(new Error(error?.message || 'Request configuration failed'));
    }
  );

  // Response interceptor for handling common errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(error?.message || 'Request failed'));
    }
  );

  return apiClient;
}

