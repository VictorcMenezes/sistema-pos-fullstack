import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

export default function Relatorios() {
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    carregarResumo();
  }, []);

  const carregarResumo = async () => {
    const { data } = await api.get('/relatorios/resumo');
    setResumo(data);
  };

  if (!resumo) return <Typography>Carregando...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Relatórios</Typography>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Vendas Hoje</Typography>
              <Typography variant="h4">R$ {resumo.totalVendasDia?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Vendas Semana</Typography>
              <Typography variant="h4">R$ {resumo.totalVendasSemana?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Vendas Mês</Typography>
              <Typography variant="h4">R$ {resumo.totalVendasMes?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
