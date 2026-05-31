import { api } from "./api";

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  provider: string;
  account_email: string | null;
  connected_at: string;
}

export interface ConnectedAccountsResponse {
  accounts: ConnectedAccount[];
  can_disconnect: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  profile_picture_url?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface DeleteAccountPayload {
  password?: string;
  confirm_delete: boolean;
}

export interface DeleteAccountResponse {
  message: string;
  deleted_at: string;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await api.get<UserProfile>("/api/v1/users/me");
    return res.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const res = await api.patch<UserProfile>("/api/v1/users/me", payload);
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.post("/api/v1/users/change-password", payload);
  },

  getConnectedAccounts: async (): Promise<ConnectedAccountsResponse> => {
    const res = await api.get<ConnectedAccountsResponse>("/api/v1/users/connected-accounts");
    return res.data;
  },

  disconnectAccount: async (provider: string): Promise<void> => {
    await api.delete(`/api/v1/users/connected-accounts/${provider}`);
  },

  deleteAccount: async (payload: DeleteAccountPayload): Promise<DeleteAccountResponse> => {
    const res = await api.delete<DeleteAccountResponse>("/api/v1/users/me", { data: payload });
    return res.data;
  },
};
