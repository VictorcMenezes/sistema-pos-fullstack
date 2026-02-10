import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Container, MenuItem } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  // Adicionei 'role' aqui para bater com seu RegisterRequest do Java
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: '', 
    senha: '',
    role: 'ADMIN' // Valor padrão
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert("Conta criada! Agora faça login.");
      navigate('/login');
    } catch (err) {
      // Melhorei o feedback de erro
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      alert("Erro ao cadastrar: " + errorMsg);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" gutterBottom align="center">Criar Nova Conta</Typography>
        <Box component="form" onSubmit={handleRegister}>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            required
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
          />
          <TextField
            label="E-mail"
            fullWidth
            margin="normal"
            type="email"
            required
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            required
            onChange={(e) => setFormData({...formData, senha: e.target.value})}
          />
          {/* Campo para Role para não quebrar o seu backend */}
          <TextField
            select
            label="Perfil"
            fullWidth
            margin="normal"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <MenuItem value="ADMIN">Administrador</MenuItem>
            <MenuItem value="USER">Vendedor</MenuItem>
          </TextField>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            Cadastrar
          </Button>
          
          <Button 
            fullWidth 
            sx={{ mt: 1 }} 
            onClick={() => navigate('/login')}
          >
            Já tenho conta? Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}   