import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  Box, Button, TextField, Typography, List, ListItem,
  ListItemText, IconButton, Paper, Grid, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';

export default function PDV() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState('');
  const [caixaId, setCaixaId] = useState(null);
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
  const [desconto, setDesconto] = useState(0);

  const carregarProdutos = useCallback(async () => {
    try {
      const { data } = await api.get('/produtos');
      setProdutos(data);
    } catch (err) {
      console.error("Erro ao carregar produtos", err);
    }
  }, []);

  const verificarCaixaAberto = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/caixas/aberto/${user.id || 4}`);
      setCaixaId(data.id);
    } catch (err) {
      console.log('Nenhum caixa aberto para este usuário.');
      setCaixaId(null);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      carregarProdutos();
      verificarCaixaAberto();
    }
  }, [user, carregarProdutos, verificarCaixaAberto]);

  const adicionarItem = (produto) => {
    if (quantidadeSelecionada <= 0) return;
    const itemExistente = carrinho.find(i => i.produto.id === produto.id);
    if (itemExistente) {
      setCarrinho(carrinho.map(i =>
        i.produto.id === produto.id
          ? { ...i, quantidade: i.quantidade + quantidadeSelecionada }
          : i
      ));
    } else {
      setCarrinho([...carrinho, { produto, quantidade: quantidadeSelecionada }]);
    }
    setQuantidadeSelecionada(1);
  };

  const alterarQuantidadeItem = (produtoId, novaQtd) => {
    if (novaQtd <= 0) {
      removerItem(produtoId);
      return;
    }
    setCarrinho(carrinho.map(i =>
      i.produto.id === produtoId ? { ...i, quantidade: novaQtd } : i
    ));
  };

  const removerItem = (produtoId) => {
    setCarrinho(carrinho.filter(i => i.produto.id !== produtoId));
  };

  const calcularSubtotal = () => carrinho.reduce((acc, item) => acc + (item.produto.precoVenda * item.quantidade), 0);
  const subtotal = calcularSubtotal();
  const total = subtotal - (Number(desconto) || 0) < 0 ? 0 : subtotal - (Number(desconto) || 0);

  const finalizarVenda = async () => {
    if (!caixaId) return alert('Caixa não está aberto!');
    if (carrinho.length === 0) return alert('Carrinho vazio!');
    const itens = carrinho.map(i => ({ produtoId: i.produto.id, quantidade: i.quantidade }));
    try {
      await api.post('/vendas', {
        caixaId,
        usuarioId: user?.id || 4,
        itens,
        formaPagamento,
        desconto: Number(desconto) || 0
      });
      alert('Venda realizada com sucesso!');
      setCarrinho([]);
      setDesconto(0);
      setFormaPagamento('DINHEIRO');
    } catch (err) {
      alert('Erro ao finalizar venda: ' + (err.response?.data?.error || 'Erro inesperado'));
    }
  };

  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>PDV - Ponto de Venda</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Buscar produto" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1, gap: 2 }}>
            <TextField label="Qtd" type="number" value={quantidadeSelecionada} onChange={(e) => setQuantidadeSelecionada(Number(e.target.value))} sx={{ width: 100 }} inputProps={{ min: 1 }} />
          </Box>
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {produtosFiltrados.map(p => (
              <ListItem key={p.id} button onClick={() => adicionarItem(p)}>
                <ListItemText primary={p.nome} secondary={`R$ ${Number(p.precoVenda).toFixed(2)}`} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Carrinho</Typography>
            <List>
              {carrinho.map(item => (
                <ListItem key={item.produto.id} secondaryAction={<IconButton onClick={() => removerItem(item.produto.id)}><DeleteIcon /></IconButton>}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField type="number" value={item.quantidade} onChange={(e) => alterarQuantidadeItem(item.produto.id, Number(e.target.value))} sx={{ width: 70 }} size="small" />
                        <Typography>{item.produto.nome}</Typography>
                      </Box>
                    }
                    secondary={`R$ ${(item.produto.precoVenda * item.quantidade).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
            <Typography>Subtotal: R$ {subtotal.toFixed(2)}</Typography>
            <TextField label="Desconto (R$)" type="number" value={desconto} onChange={(e) => setDesconto(e.target.value)} fullWidth sx={{ mt: 1 }} />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Forma de Pagamento</InputLabel>
              <Select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                <MenuItem value="CREDITO">Crédito</MenuItem>
                <MenuItem value="DEBITO">Débito</MenuItem>
                <MenuItem value="PIX">PIX</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="h5" sx={{ mt: 2 }}>Total: R$ {total.toFixed(2)}</Typography>
            <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={finalizarVenda} disabled={carrinho.length === 0}>
              Finalizar Venda
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}