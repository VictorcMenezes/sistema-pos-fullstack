import api from './api';

export const authService = {
  async login(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  },

  async register(nome, email, senha, role) {
    await api.post('/auth/register', { nome, email, senha, role });
  },

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
};
