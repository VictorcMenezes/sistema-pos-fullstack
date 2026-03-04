import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Paper, LinearProgress
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    carregarResumo();
  }, []);

  const carregarResumo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/relatorios/resumo-dia');
      setResumo(data);
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (!resumo) return <Typography p={3}>Não foi possível carregar os dados.</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Bem-vindo de volta, <b>{user?.nome || 'Usuário'}</b>. Aqui está o resumo de hoje.
      </Typography>

      {/* Cards de KPI - Usando os nomes que vêm do seu DTO Java */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', borderLeft: '5px solid #1976d2' }}>
            <CardContent>
              <Typography variant="subtitle2" color="primary">VENDAS HOJE</Typography>
              <Typography variant="h4">R$ {Number(resumo.totalDia || 0).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f1f8e9', borderLeft: '5px solid #4caf50' }}>
            <CardContent>
              <Typography variant="subtitle2" color="success.main">QTD. VENDAS</Typography>
              <Typography variant="h4">{resumo.qtdDia || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', borderLeft: '5px solid #ff9800' }}>
            <CardContent>
              <Typography variant="subtitle2" color="warning.main">TICKET MÉDIO</Typography>
              <Typography variant="h4">R$ {Number(resumo.ticketMedio || 0).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5', borderLeft: '5px solid #9c27b0' }}>
            <CardContent>
              <Typography variant="subtitle2" color="secondary">ITENS VENDIDOS</Typography>
              <Typography variant="h4">{resumo.totalItensHoje || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Últimas Vendas */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Últimas Vendas</Typography>
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Pagamento</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resumo.ultimasVendas && resumo.ultimasVendas.length > 0 ? (
              resumo.ultimasVendas.map((venda) => {
                const formatarHora = (dataRaw) => {
                  if (!dataRaw) return '--:--';
                  try {
                    const data = new Date(dataRaw);
                    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  } catch (e) {
                    return '--:--';
                  }
                };

                return (
                  <TableRow key={venda.id}>
                    <TableCell>#{venda.id}</TableCell>
                    <TableCell>
                      {formatarHora(venda.dataCriacao)}
                    </TableCell>
                    <TableCell>{venda.formaPagamento || '---'}</TableCell>
                    <TableCell align="right">

                      R$ {Number(venda.total || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  Nenhuma venda realizada hoje.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}