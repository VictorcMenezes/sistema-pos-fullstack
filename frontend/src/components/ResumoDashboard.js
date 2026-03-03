import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import api from '../services/api'; 

export default function ResumoDashboard() {
  const [stats, setStats] = useState({
    totalVendas: 0,
    quantidadeVendas: 0,
    topProdutos: [],
    vendasPorForma: []
  });

  useEffect(() => {
    const carregarDados = async () => {
  try {
    const fim = new Date().toISOString().split('T')[0];
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 7);
    const inicioStr = inicio.toISOString().split('T')[0];

    const { data } = await api.get(`/dashboard/resumo?inicio=${inicioStr}&fim=${fim}`);
    setStats(data);
  } catch (err) {
    console.error("Erro ao carregar resumo", err);
  }
};
    carregarDados();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Visão Geral (Hoje)</Typography>
      
      <Grid container spacing={3}>
        {/* Card: Total Financeiro */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#2e7d32', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total em Vendas</Typography>
              <Typography variant="h3">R$ {Number(stats.totalVendas).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card: Quantidade de Pedidos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Pedidos Realizados</Typography>
              <Typography variant="h3">{stats.quantidadeVendas}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista: Produtos Mais Vendidos */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Produtos Mais Vendidos</Typography>
            {stats.topProdutos.length > 0 ? (
              stats.topProdutos.map((p, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, borderBottom: '1px solid #eee' }}>
                  <Typography>{p.nome}</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>{p.quantidade} un.</Typography>
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">Nenhuma venda hoje.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}