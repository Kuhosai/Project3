export interface UrlResponse {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string;
  clickCount: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
}

export interface DailyClickStatsDto {
  date: string;
  clickCount: number;
}

export interface CountryStatsDto {
  country: string;
  clickCount: number;
  percentage: number;
}

export interface BrowserStatsDto {
  browser: string;
  clickCount: number;
  percentage: number;
}

export interface CreateUrlRequest {
  originalUrl: string;
  expiresAt?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
}
