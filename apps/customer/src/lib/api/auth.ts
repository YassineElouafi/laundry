import { api } from './client';
import type { AuthUser } from '../../stores/auth-store';
import type { UserDto } from '@laundry/shared';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: UserDto;
}

export function toAuthUser(u: UserDto): AuthUser {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    role: (u.role?.name ?? '').toLowerCase(),
  };
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  email?: string;
  password?: string;
  oldPassword?: string;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserDto> {
  const { data } = await api.patch<UserDto>('/auth/me', input);
  return data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/email/login', { email, password });
  return data;
}

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  await api.post('/auth/email/register', input);
}

export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/google/login', { idToken });
  return data;
}

export async function loginWithApple(input: {
  idToken: string;
  firstName?: string | null;
  lastName?: string | null;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/apple/login', input);
  return data;
}

export async function loginWithFacebook(accessToken: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/facebook/login', { accessToken });
  return data;
}

export async function fetchMe(): Promise<UserDto> {
  const { data } = await api.get<UserDto>('/auth/me');
  return data;
}
