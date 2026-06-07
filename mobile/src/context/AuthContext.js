import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password, type) => {
    try {
      const response = await api.post('/auth/login', { email, password, userType: type });
      const { token, user } = response.data;
      
      setUserToken(token);
      setUserId(user.id);
      setUserType(type);
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', user.id);
      await AsyncStorage.setItem('userType', type);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Giriş başarısız' };
    }
  };

  const logout = async () => {
    setUserToken(null);
    setUserId(null);
    setUserType(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userType');
  };

  const checkLoginState = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const id = await AsyncStorage.getItem('userId');
      const type = await AsyncStorage.getItem('userType');
      if (token) {
        setUserToken(token);
        setUserId(id);
        setUserType(type);
      }
    } catch (e) {
      console.log('Token fetching error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginState();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, userToken, userId, userType, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
