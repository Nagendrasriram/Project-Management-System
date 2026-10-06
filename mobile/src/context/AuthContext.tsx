import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient, setSessionExpiryHandler } from '../api/client';
import { LoginInput, RegisterInput, UserResponse, AuthSuccessResponse } from '@project-mgmt/shared';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiredMessage: string | null;
  clearExpiredMessage: () => void;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const clearExpiredMessage = () => {
    setSessionExpiredMessage(null);
  };

  useEffect(() => {
    // Register 401 callback from axios interceptor
    setSessionExpiryHandler(() => {
      setToken(null);
      setUser(null);
      setSessionExpiredMessage('Your session has expired. Please log in again.');
    });

    const loadPersistedAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('user_token');
        const storedUser = await SecureStore.getItemAsync('user_data');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify with backend
          try {
            const res = await apiClient.get<UserResponse>('/auth/me');
            setUser(res.data);
            await SecureStore.setItemAsync('user_data', JSON.stringify(res.data));
          } catch (err: any) {
            if (err.response?.status === 401) {
              await SecureStore.deleteItemAsync('user_token');
              await SecureStore.deleteItemAsync('user_data');
              setToken(null);
              setUser(null);
              setSessionExpiredMessage('Your session has expired. Please log in again.');
            }
          }
        }
      } catch (e) {
        console.warn('Error restoring auth state from SecureStore:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedAuth();
  }, []);

  const login = async (credentials: LoginInput) => {
    clearExpiredMessage();
    const res = await apiClient.post<AuthSuccessResponse>('/auth/login', credentials);
    const { token: newToken, user: newUser } = res.data;

    // SecureStore ONLY (Android Keystore / iOS Keychain)
    await SecureStore.setItemAsync('user_token', newToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const register = async (data: RegisterInput) => {
    clearExpiredMessage();
    const res = await apiClient.post<AuthSuccessResponse>('/auth/register', data);
    const { token: newToken, user: newUser } = res.data;

    await SecureStore.setItemAsync('user_token', newToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      await SecureStore.deleteItemAsync('user_token');
      await SecureStore.deleteItemAsync('user_data');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        sessionExpiredMessage,
        clearExpiredMessage,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
