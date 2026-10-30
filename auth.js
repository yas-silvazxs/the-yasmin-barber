/**
 * Sessão do cliente (The Yasmin Barber)
 * API base: http://localhost:3000
 */
const API_BASE = 'http://localhost:3000';
const AUTH_KEY = 'tyb_cliente';

const Auth = {
  getUser: function () {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  isLoggedIn: function () {
    return !!this.getUser();
  },

  login: function (user) {
    if (!user) return;
    const payload = {
      id: user.id || user._id || null,
      nome: user.nome || '',
      email: user.email || '',
      celular: user.celular || user.telefone || '',
      token: user.token || null
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    if (user.token) localStorage.setItem('token', user.token);
  },

  logout: function () {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('token');
  },

  /** Se não estiver logado, redireciona para index.html (login) */
  requireAuth: function () {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
};