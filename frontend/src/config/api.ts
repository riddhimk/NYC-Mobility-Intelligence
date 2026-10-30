// API & WebSocket Configuration
// Automatically adapts to environment variables in Cloud / Vercel, or falls back to localhost for local dev.

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

export const WS_BASE_URL: string =
  (import.meta.env.VITE_WS_BASE_URL as string) ||
  (API_BASE_URL.startsWith('https://')
    ? API_BASE_URL.replace('https://', 'wss://') + '/ws/stream'
    : API_BASE_URL.replace('http://', 'ws://') + '/ws/stream');

