// src/components/Relatorios.js - MELHORADO
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

export default function Relatorios() {
  const { user } = useAuth();
  const [resumo, setResumo] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async (dataIni = null, dataFi = null, forma = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dataIni) params.append('dataInicio', dataIni);
      if (dataFi) params.append('dataFim', dataFi);
      if (forma) params.append('formaPagamento', forma);

      // Carrega resumo
      const { data: resumoData } = await api.get(`/relatorios/resumo?${params.toString()}`);
      setResumo(resumoData);

      // Carrega lista de vendas
      const { data: vendasData } = await api.get(`/vendas?${params.toString()}`);
      setVendas(vendasData);
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    }
    setLoading(false);
  };

  const handleFiltrar = () => {
    carregarDados(dataInicio, dataFim, filtroFormaPagamento);
  };

  const handleLimparFiltro = () => {
    setDataInicio('');
    setDataFim('');
    setFiltroFormaPagamento('');
    carregarDados();
  };

  if (loading && !resumo) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Relatórios</Typography>

      {/* Seção de Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filtros</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data Fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Forma de Pagamento</InputLabel>
              <Select
                label="Forma de Pagamento"
                value={filtroFormaPagamento}
                onChange={(e) => setFiltroFormaPagamento(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                <MenuItem value="CREDITO">Crédito</MenuItem>
                <MenuItem value="DEBITO">Débito</MenuItem>
                <MenuItem value="PIX">PIX</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant="contained" onClick={handleFiltrar} fullWidth>
              Filtrar
            </Button>
            <Button variant="outlined" onClick={handleLimparFiltro} fullWidth>
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cards de resumo */}
      {resumo && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Vendas Hoje
                </Typography>
                <Typography variant="h4">
                  R$ {Number(resumo.totalVendasDia || 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Vendas Semana
                </Typography>
                <Typography variant="h4">
                  R$ {Number(resumo.totalVendasSemana || 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Vendas Mês
                </Typography>
                <Typography variant="h4">
                  R$ {Number(resumo.totalVendasMes || 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Filtrado
                </Typography>
                <Typography variant="h4">
                  R$ {Number(resumo.totalFiltrado || 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabela de vendas */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Forma Pagamento</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>{venda.id}</TableCell>
                  <TableCell>
                    {new Date(venda.dataCriacao).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{venda.formaPagamento}</TableCell>
                  <TableCell>R$ {Number(venda.total).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {vendas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
