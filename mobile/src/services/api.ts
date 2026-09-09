import axios from 'axios';

// Base URL for the backend API (defaults to secure HTTPS in production)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? 'http://localhost:3000' : 'https://api.traffictest.com');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sets the Authorization Bearer token on all subsequent API requests.
 * Call this after login with the JWT token received from the server.
 */
export function setAuthToken(token: string): void {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * Clears the Authorization header (e.g. on logout).
 */
export function clearAuthToken(): void {
  delete api.defaults.headers.common['Authorization'];
}

export default api;
