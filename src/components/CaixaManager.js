import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Paper
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; 

export default function CaixaManager() {
  const { user } = useAuth();
  const [caixaAtual, setCaixaAtual] = useState(null);
  const [valorAbertura, setValorAbertura] = useState('');

  
  const carregarCaixa = useCallback(async () => {
    if (!user) return;
    const usuarioId = user.id;
    try {
      const { data } = await api.get(`/caixas/aberto/${usuarioId}`);
      setCaixaAtual(data);
    } catch (err) {
      setCaixaAtual(null);
    }
  }, [user]);

  useEffect(() => {
    carregarCaixa();
  }, [carregarCaixa]);

  const abrirCaixa = async () => {
    if (!user) return alert("Usuário não identificado.");
    try {
      const { data } = await api.post('/caixas/abrir', {
        usuarioId: user.id,
        valorAbertura: Number(valorAbertura) || 0
      });
      setCaixaAtual(data);
      setValorAbertura('');
      alert('Caixa aberto com sucesso!');
    } catch (err) {
      alert('Erro ao abrir caixa: ' + (err.response?.data?.error || 'Erro inesperado'));
    }
  };

    const fecharCaixa = async () => {
        if (!caixaAtual) return;
        try {
            // Removemos o 'const { data } =' para sumir o aviso do ESLint
            await api.post(`/caixas/${caixaAtual.id}/fechar`, {
                valorFechamento: Number(caixaAtual.saldoAtual) || 0 
            });
            alert(`Caixa fechado com sucesso!`);
            setCaixaAtual(null);
        } catch (err) {
            console.error(err);
            alert('Erro ao fechar: ' + (err.response?.data?.message || 'Erro no servidor'));
        }
    };
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Gestão de Caixa</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">
              {caixaAtual ? 'Caixa Aberto' : 'Nenhum Caixa Aberto'}
            </Typography>

            {caixaAtual ? (
              <Box sx={{ mt: 2 }}>
                <Typography>Caixa ID: {caixaAtual.id}</Typography>
                <Typography>Data Abertura: {new Date(caixaAtual.dataAbertura).toLocaleString()}</Typography>
                <Typography>Valor Abertura: R$ {Number(caixaAtual.valorAbertura).toFixed(2)}</Typography>
                <Typography>Saldo Atual: R$ {Number(caixaAtual.saldoAtual || 0).toFixed(2)}</Typography>

                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 2 }}
                  onClick={fecharCaixa}
                >
                  Fechar Caixa
                </Button>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Valor de Abertura (R$)"
                  type="number"
                  value={valorAbertura}
                  onChange={(e) => setValorAbertura(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={abrirCaixa}
                >
                  Abrir Caixa
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}