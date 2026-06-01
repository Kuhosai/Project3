import axios from 'axios';
import type { AxiosInstance } from 'axios';
import authService from './authService';
import type {
  UrlResponse,
  AuthResponse,
  DailyClickStatsDto,
  CountryStatsDto,
  BrowserStatsDto,
  CreateUrlRequest,
  LoginRequest,
  SignupRequest,
} from '../types/api.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 clear tokens and redirect to /login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.clearTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // URL endpoints
  createUrl(data: CreateUrlRequest): Promise<UrlResponse> {
    return axiosInstance.post<UrlResponse>('/api/urls', data).then((r) => r.data);
  },

  getUserUrls(): Promise<UrlResponse[]> {
    return axiosInstance.get<UrlResponse[]>('/api/urls').then((r) => r.data);
  },

  getUrlDetails(id: number): Promise<UrlResponse> {
    return axiosInstance.get<UrlResponse>(`/api/urls/${id}`).then((r) => r.data);
  },

  // Analytics endpoints
  getDailyStats(urlId: number): Promise<DailyClickStatsDto[]> {
    return axiosInstance
      .get<DailyClickStatsDto[]>(`/api/analytics/${urlId}/daily`)
      .then((r) => r.data);
  },

  getCountryStats(urlId: number): Promise<CountryStatsDto[]> {
    return axiosInstance
      .get<CountryStatsDto[]>(`/api/analytics/${urlId}/countries`)
      .then((r) => r.data);
  },

  getBrowserStats(urlId: number): Promise<BrowserStatsDto[]> {
    return axiosInstance
      .get<BrowserStatsDto[]>(`/api/analytics/${urlId}/browsers`)
      .then((r) => r.data);
  },

  // Auth endpoints
  login(data: LoginRequest): Promise<AuthResponse> {
    return axiosInstance.post<AuthResponse>('/api/auth/login', data).then((r) => r.data);
  },

  signup(data: SignupRequest): Promise<void> {
    return axiosInstance.post('/api/auth/signup', data).then(() => undefined);
  },

  refreshToken(): Promise<AuthResponse> {
    const refreshToken = authService.getRefreshToken();
    return axiosInstance
      .post<AuthResponse>('/api/auth/refresh', { refreshToken })
      .then((r) => r.data);
  },
};

// ── Mock service for local development without backend ──────────────────────
const today = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const dateStr = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const mockApiService = {
  getMockUrls(): Promise<UrlResponse[]> {
    return Promise.resolve([
      {
        id: 1,
        shortCode: 'abc123',
        shortUrl: 'http://localhost:8080/abc123',
        originalUrl: 'https://www.example.com/very/long/path/that/needs/shortening',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        clickCount: 42,
      },
      {
        id: 2,
        shortCode: 'xyz789',
        shortUrl: 'http://localhost:8080/xyz789',
        originalUrl: 'https://github.com/some-user/some-repository/blob/main/README.md',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        clickCount: 17,
      },
      {
        id: 3,
        shortCode: 'qwe456',
        shortUrl: 'http://localhost:8080/qwe456',
        originalUrl: 'https://www.google.com/search?q=url+shortener+react+typescript',
        createdAt: new Date().toISOString(),
        clickCount: 0,
      },
    ]);
  },

  getMockDailyStats(): Promise<DailyClickStatsDto[]> {
    return Promise.resolve([
      { date: dateStr(6), clickCount: 5 },
      { date: dateStr(5), clickCount: 12 },
      { date: dateStr(4), clickCount: 8 },
      { date: dateStr(3), clickCount: 20 },
      { date: dateStr(2), clickCount: 15 },
      { date: dateStr(1), clickCount: 30 },
      { date: dateStr(0), clickCount: 22 },
    ]);
  },

  getMockCountryStats(): Promise<CountryStatsDto[]> {
    return Promise.resolve([
      { country: 'South Korea', clickCount: 45, percentage: 40.5 },
      { country: 'United States', clickCount: 30, percentage: 27.0 },
      { country: 'Japan', clickCount: 15, percentage: 13.5 },
      { country: 'Germany', clickCount: 12, percentage: 10.8 },
      { country: 'Others', clickCount: 9, percentage: 8.1 },
    ]);
  },

  getMockBrowserStats(): Promise<BrowserStatsDto[]> {
    return Promise.resolve([
      { browser: 'Chrome', clickCount: 55, percentage: 49.5 },
      { browser: 'Safari', clickCount: 25, percentage: 22.5 },
      { browser: 'Firefox', clickCount: 18, percentage: 16.2 },
      { browser: 'Edge', clickCount: 10, percentage: 9.0 },
      { browser: 'Other', clickCount: 3, percentage: 2.7 },
    ]);
  },
};

export default apiService;
