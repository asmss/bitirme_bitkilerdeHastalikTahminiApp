import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const isLoggedIn = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const user = await SecureStore.getItemAsync('userInfo');

      if (token) {
        setUserToken(token);
        setUserInfo(user ? JSON.parse(user) : null);
      }
    } catch (e) {
      console.log("Giriş kontrolü hatası:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      await SecureStore.setItemAsync('userToken', String(token));
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));

      setUserToken(token);
      setUserInfo(user);
    } catch (error) {
      const message = error.response?.data?.error || "Giriş başarısız";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { username, email, password });
      const { token, user } = res.data;

      await SecureStore.setItemAsync('userToken', String(token));
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));

      setUserToken(token);
      setUserInfo(user);
    } catch (error) {
      const message = error.response?.data?.error || "Kayıt başarısız";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userInfo');
      setUserToken(null);
      setUserInfo(null);
    } catch (e) {
      console.log("Çıkış hatası:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        login, 
        register, 
        logout, 
        isLoading: !!isLoading, 
        userToken: userToken, 
        userInfo: userInfo 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};