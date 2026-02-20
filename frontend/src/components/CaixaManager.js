
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CaixaManager() {
  const { user } = useAuth();
  const [caixaAtual, setCaixaAtual] = useState(null);
  const [valorAbertura, setValorAbertura] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCaixa();
  }, []);

  const carregarCaixa = async () => {
  // Se o id for uma string que parece email ou estiver vazio, não faz a busca
  if (!user?.id || typeof user.id === 'string' && user.id.includes('@')) {
    console.error("ID de usuário inválido encontrado:", user?.id);
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    const { data } = await api.get(`/caixas/aberto/${user.id}`);
    setCaixaAtual(data);
  } catch (err) {
    console.error("Erro ao carregar caixa:", err);
    setCaixaAtual(null);
  }
  setLoading(false);
}

  const abrirCaixa = async () => {
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

    const valorFechamentoStr = prompt("Digite o valor final para fechar o caixa:", "0");
    const valorFechamento = parseFloat(valorFechamentoStr) || 0;

    try {
      
      const { data } = await api.post(`/caixas/${caixaAtual.id}/fechar`, {
        valorFechamento: valorFechamento
      });

      alert(`Caixa fechado com sucesso!`);
      setCaixaAtual(null);
      setValorAbertura('');
      carregarCaixa(); 
    } catch (err) {
      console.error(err);
      alert('Erro ao fechar caixa: ' + (err.response?.data?.error || 'Erro na rota ou valor inválido'));
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Gestão de Caixa</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">
              {caixaAtual ? '✅ Caixa Aberto' : '❌ Nenhum Caixa Aberto'}
            </Typography>

            {caixaAtual ? (
              <Box sx={{ mt: 2 }}>
                <Card sx={{ mb: 2, backgroundColor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography>Caixa ID: <strong>{caixaAtual.id}</strong></Typography>
                    <Typography>Data Abertura: <strong>{new Date(caixaAtual.dataAbertura).toLocaleString('pt-BR')}</strong></Typography>
                    <Typography>Valor Abertura: <strong>R$ {Number(caixaAtual.valorAbertura).toFixed(2)}</strong></Typography>
                    <Typography variant="h6" sx={{ mt: 1, color: 'green' }}>
                      Saldo Atual: R$ {Number(caixaAtual.saldoAtual || 0).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>

                <Button
                  variant="contained"
                  color="error"
                  fullWidth
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
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={abrirCaixa}
                >
                  Abrir Caixa
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Informações do Usuário</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography>Nome: <strong>{user?.nome || 'N/A'}</strong></Typography>
              <Typography>Email: <strong>{user?.email || 'N/A'}</strong></Typography>
              <Typography>Role: <strong>{user?.role || 'N/A'}</strong></Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
