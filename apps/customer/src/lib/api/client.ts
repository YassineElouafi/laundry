import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URL } from '../env';
import { useAuthStore } from '../../stores/auth-store';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh on 401, then replay the original request.
let refreshing: Promise<string> | null = null;

async function refresh(): Promise<string> {
  const { refreshToken, setTokens } = useAuthStore.getState();
  if (!refreshToken) throw new Error('no refresh token');
  const res = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } }
  );
  const { token, refreshToken: newRefresh } = res.data as {
    token: string;
    refreshToken: string;
  };
  await setTokens(token, newRefresh);
  return token;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const isAuth = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && original && !original._retry && !isAuth) {
      original._retry = true;
      try {
        refreshing = refreshing ?? refresh();
        const token = await refreshing;
        refreshing = null;
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      } catch (e) {
        refreshing = null;
        await useAuthStore.getState().reset();
        throw e;
      }
    }
    throw error;
  }
);
