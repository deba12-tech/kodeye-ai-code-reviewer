import { api, API_V1_BASE_URL } from "./api";


export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  is_verified: boolean;
  role: string;
  plan: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface UserSession {
  id: number;
  device_info: string | null;
  ip_address: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}


function saveTokens(access: string, refresh: string): void {
  localStorage.setItem("kodeye_access_token", access);
  localStorage.setItem("kodeye_refresh_token", refresh);
}

function clearTokens(): void {
  localStorage.removeItem("kodeye_access_token");
  localStorage.removeItem("kodeye_refresh_token");
}


export const authService = {

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/api/v1/auth/register", { name, email, password });
    saveTokens(res.data.access_token, res.data.refresh_token);
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/api/v1/auth/login", { email, password });
    saveTokens(res.data.access_token, res.data.refresh_token);
    return res.data;
  },

  refreshToken: async (refresh_token: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/api/v1/auth/refresh", { refresh_token });
    saveTokens(res.data.access_token, res.data.refresh_token);
    return res.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("kodeye_refresh_token");
    clearTokens();
    if (refreshToken) {
      try {
        await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
      } catch {
      }
    }
  },

  logoutAll: async (): Promise<void> => {
    clearTokens();
    await api.post("/api/v1/auth/logout-all");
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<User>("/api/v1/auth/me");
    return res.data;
  },

  requestEmailVerification: async (email?: string): Promise<{ message: string }> => {
    const res = await api.post("/api/v1/auth/verify-email/request", { email });
    return res.data;
  },

  confirmEmailVerification: async (token: string): Promise<{ message: string }> => {
    const res = await api.post("/api/v1/auth/verify-email/confirm", { token });
    return res.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await api.post("/api/v1/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (token: string, new_password: string): Promise<{ message: string }> => {
    const res = await api.post("/api/v1/auth/reset-password", { token, new_password });
    return res.data;
  },

  getSessions: async (): Promise<UserSession[]> => {
    const res = await api.get<UserSession[]>("/api/v1/auth/sessions");
    return res.data;
  },

  deleteSession: async (session_id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/api/v1/auth/sessions/${session_id}`);
    return res.data;
  },

  loginWithGoogle: (): void => {
    window.location.href = `${API_V1_BASE_URL}/auth/google/login`;
  },

  loginWithGitHub: (): void => {
    window.location.href = `${API_V1_BASE_URL}/auth/github/login`;
  },

  /**
   * Called from the /auth/callback page after the provider redirects back.
   * Reads access_token and refresh_token from URLSearchParams.
   * Supports both "access_token" and "token" param names as fallbacks.
   * Stores Kodeye app tokens only; provider-issued tokens stay on the backend.
   * Returns the user profile fetched from /auth/me.
   */
  handleOAuthCallback: async (params: URLSearchParams): Promise<User> => {
    const access_token = params.get("access_token") || params.get("token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      throw new Error("OAuth callback is missing required token parameters.");
    }

    // Store only app tokens; provider tokens stay on the backend.
    saveTokens(access_token, refresh_token);

    const user = await authService.getCurrentUser();
    return user;
  },
};
