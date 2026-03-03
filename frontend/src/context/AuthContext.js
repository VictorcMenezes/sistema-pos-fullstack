import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const processToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    console.log("Token decodificado:", decoded);

    return {
      id: decoded.userId || decoded.id || decoded.sub,
      nome: decoded.nome || decoded.name || decoded.sub || "Usuário", 
      email: decoded.email || decoded.sub,      
      role: decoded.role || decoded.roles || decoded.authorities || "N/A",
      authenticated: true
    };
  } catch (err) {
    console.error('Erro ao decodificar token:', err);
    return null;
  }
};

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      const userData = processToken(token);
      if (userData) {
        setUser(userData);
      } else {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    const userData = processToken(token);
    if (userData) {
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);