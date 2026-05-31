import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import type { User } from "../services/authService";


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  handleOAuthCallback: (params: URLSearchParams) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const refreshUser = async (): Promise<void> => {
    const token = localStorage.getItem("kodeye_access_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem("kodeye_access_token");
      localStorage.removeItem("kodeye_refresh_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // Fired by the Axios interceptor when refresh-token rotation fails.
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("kodeye_access_token");
      localStorage.removeItem("kodeye_refresh_token");
      const publicPaths = ["/", "/auth", "/forgot-password", "/reset-password", "/verify-email", "/auth/callback", "/features"];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/auth";
      }
    };

    window.addEventListener("kodeye_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("kodeye_unauthorized", handleUnauthorized);
  }, []);


  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await authService.register(name, email, password);
      setUser(data.user);
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const logoutAll = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logoutAll();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };
  const handleOAuthCallback = async (params: URLSearchParams): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.handleOAuthCallback(params);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      setUser(null);
      localStorage.removeItem("kodeye_access_token");
      localStorage.removeItem("kodeye_refresh_token");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        logoutAll,
        refreshUser,
        handleOAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
