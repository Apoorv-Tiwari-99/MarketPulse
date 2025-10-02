import api from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        await this.setToken(response.data.token);
        await this.setUser(response.data.user);
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(username: string, email: string, password: string) {
    try {
      const response = await api.post('/auth/register', { 
        username, 
        email, 
        password 
      });
      
      if (response.data.success) {
        await this.setToken(response.data.token);
        await this.setUser(response.data.user);
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  async setToken(token: string) {
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  async setUser(user: any) {
    try {
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  async getUser() {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  async clearAuth() {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
};