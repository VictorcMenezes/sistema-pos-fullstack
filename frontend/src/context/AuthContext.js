import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
  try {
    const response = await authService.login(email, senha);
    
    // Verifique se response e response.id existem
    if (response && response.id) {
      const userData = {
        id: response.id, 
        nome: response.nome,
        role: response.role,
        authenticated: true
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return response;
    } else {
      throw new Error("Dados do usuário não retornados pelo servidor");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    throw error; 
  }
};

  const logout = () => {
    authService.logout();
    localStorage.removeItem('user'); 
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);