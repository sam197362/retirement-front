const API_URL = '/api';

import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    adminToken: localStorage.getItem('adminToken') || null,
    admin: JSON.parse(localStorage.getItem('admin')) || null,
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdminAuthenticated: (state) => !!state.adminToken,
    currentUser: (state) => state.user,
    currentAdmin: (state) => state.admin,
  },
  
  actions: {
    // User Register
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post(`${API_URL}/auth/register`, userData);
        if (res.data.success) {
          this.token = res.data.token;
          this.user = res.data.user;
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          return { success: true, message: res.data.message };
        }
      } catch (err) {
        this.error = err.response?.data?.message || '註冊失敗，請稍後再試';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // User Login
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        if (res.data.success) {
          this.token = res.data.token;
          this.user = res.data.user;
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          return { success: true, message: res.data.message };
        }
      } catch (err) {
        this.error = err.response?.data?.message || '登入失敗，請檢查電子郵件和密碼';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Get User Profile
    async getProfile() {
      if (!this.token) return;
      try {
        const res = await axios.get(`${API_URL}/auth/profile`);
        if (res.data.success) {
          this.user = {
            ...this.user,
            ...res.data.data.user
          };
          localStorage.setItem('user', JSON.stringify(this.user));
          return res.data.data;
        }
      } catch (err) {
        if (err.response?.status === 401) {
          this.logout();
        }
        throw err;
      }
    },

    // Update User Profile
    async updateProfile(profileData) {
      if (!this.token) return { success: false, message: '未登入' };
      this.loading = true;
      try {
        const res = await axios.put(`${API_URL}/auth/profile`, profileData);
        if (res.data.success) {
          this.user = {
            ...this.user,
            ...res.data.data.user
          };
          localStorage.setItem('user', JSON.stringify(this.user));
          return { success: true, data: res.data.data, message: res.data.message };
        }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || '更新資料失敗' };
      } finally {
        this.loading = false;
      }
    },

    // Change User Password
    async changePassword(passwords) {
      if (!this.token) return { success: false, message: '未登入' };
      try {
        const res = await axios.put(`${API_URL}/auth/password`, passwords);
        return { success: true, message: res.data.message };
      } catch (err) {
        return { success: false, message: err.response?.data?.message || '變更密碼失敗' };
      }
    },

    // User Logout
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    // ================= ADMIN ACTIONS =================

    // Admin Login
    async adminLogin(account, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post(`${API_URL}/admin/login`, { account, password });
        if (res.data.success) {
          this.adminToken = res.data.token;
          this.admin = res.data.admin;
          localStorage.setItem('adminToken', this.adminToken);
          localStorage.setItem('admin', JSON.stringify(this.admin));
          return { success: true, message: res.data.message };
        }
      } catch (err) {
        this.error = err.response?.data?.message || '管理員登入失敗，請檢查帳號和密碼';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Admin Logout
    adminLogout() {
      this.adminToken = null;
      this.admin = null;
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
    },

    // Initialize Store
    init() {
      this.token = localStorage.getItem('token') || null;
      this.user = JSON.parse(localStorage.getItem('user')) || null;
      this.adminToken = localStorage.getItem('adminToken') || null;
      this.admin = JSON.parse(localStorage.getItem('admin')) || null;
    }
  }
});
