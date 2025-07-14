import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import Toast from 'react-native-toast-message';

type User = {
  name: string;
  email: string;
};

type AuthContextData = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStorageData();
  }, []);

  async function loadUserStorageData() {
    try {
      const [storedUser, token] = await Promise.all([
        AsyncStorage.getItem('@user'),
        AsyncStorage.getItem('@token'),
      ]);

      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.warn('Erro ao carregar dados do usuário do AsyncStorage:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string): Promise<boolean> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.access_token;

      if (!token) throw new Error('Token não recebido');

      await AsyncStorage.setItem('@token', token);

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      const userResponse = await api.get('/users/me');
      const fetchedUser = userResponse.data;

      await AsyncStorage.setItem('@user', JSON.stringify(fetchedUser));
      setUser(fetchedUser);

      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao fazer login';
      Toast.show({
        type: 'error',
        text1: 'Login falhou',
        text2: message,
        position: 'bottom',
      });
      return false;
    }
  }

  async function signOut() {
    await AsyncStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
