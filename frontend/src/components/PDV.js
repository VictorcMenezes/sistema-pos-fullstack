  
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Typography, List, ListItem,
  ListItemText, IconButton, Paper, Grid, MenuItem, Select, InputLabel, FormControl, Card, CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from '../hooks/useSnackbar';
import { Snackbar, Alert } from '@mui/material';

export default function PDV() {
  const { user } = useAuth(); // Pega dados do usuário logado
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState('');
  const [caixaId, setCaixaId] = useState(null);
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
  const [desconto, setDesconto] = useState(0);
  const { open, message, severity, showSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    carregarProdutos();
    verificarCaixaAberto();
  }, []);

  const carregarProdutos = async () => {
    try {
      const { data } = await api.get('/produtos');
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  const verificarCaixaAberto = async () => {
    try {
      const { data } = await api.get(`/caixas/aberto/${user.id}`); // Usa ID do usuário
      setCaixaId(data.id);
    } catch (err) {
      console.warn('Nenhum caixa aberto.');
    }
  };

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

  const calcularSubtotal = () => {
    return carrinho.reduce((acc, item) =>
      acc + (item.produto.precoVenda * item.quantidade), 0
    );
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const desc = Number(desconto) || 0;
    const total = subtotal - desc;
    return total < 0 ? 0 : total;
  };

   const finalizarVenda = async () => {
    if (!caixaId) {
      showSnackbar('Nenhum caixa aberto! Vá em "Caixa" e abra um caixa.', 'warning');
      return;
    }
    if (carrinho.length === 0) {
      showSnackbar('Carrinho vazio!', 'warning');
      return;
    }

    const itens = carrinho.map(i => ({
      produtoId: i.produto.id,
      quantidade: i.quantidade
    }));

    try {
      await api.post('/vendas', {
        caixaId,
        usuarioId: user.id,
        itens,
        formaPagamento,
        desconto: Number(desconto) || 0
      });
      showSnackbar('Venda realizada com sucesso!', 'success');
      setCarrinho([]);
      setDesconto(0);
      setFormaPagamento('DINHEIRO');
    } catch (err) {
      showSnackbar('Erro ao finalizar venda: ' + (err.response?.data?.error || 'Erro inesperado'), 'error');
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const subtotal = calcularSubtotal();
  const total = calcularTotal();

  if (!caixaId) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>PDV - Ponto de Venda</Typography>
        <Card sx={{ backgroundColor: '#fff3cd' }}>
          <CardContent>
            <Typography color="error">
              ⚠️ Nenhum caixa aberto. Vá até a aba "Caixa" e abra um caixa antes de realizar vendas.
            </Typography>
          </CardContent>
        </Card>
        <Snackbar open={open} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={closeSnackbar} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
    </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>PDV - Ponto de Venda</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Buscar produto"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1, gap: 2 }}>
            <TextField
              label="Qtd"
              type="number"
              value={quantidadeSelecionada}
              onChange={(e) => setQuantidadeSelecionada(Number(e.target.value))}
              sx={{ width: 100 }}
              inputProps={{ min: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Clique no produto para adicionar ao carrinho
            </Typography>
          </Box>

          <List sx={{ maxHeight: 400, overflow: 'auto', mt: 1 }}>
            {produtosFiltrados.map(p => (
              <ListItem key={p.id} button onClick={() => adicionarItem(p)}>
                <ListItemText
                  primary={p.nome}
                  secondary={`R$ ${Number(p.precoVenda).toFixed(2)}`}
                />
              </ListItem>
            ))}
            {produtosFiltrados.length === 0 && (
              <ListItem>
                <ListItemText primary="Nenhum produto encontrado." />
              </ListItem>
            )}
          </List>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Carrinho</Typography>
            <List>
              {carrinho.map(item => (
                <ListItem
                  key={item.produto.id}
                  secondaryAction={
                    <IconButton onClick={() => removerItem(item.produto.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          type="number"
                          value={item.quantidade}
                          onChange={(e) =>
                            alterarQuantidadeItem(
                              item.produto.id,
                              Number(e.target.value)
                            )
                          }
                          sx={{ width: 70 }}
                          inputProps={{ min: 1 }}
                          size="small"
                        />
                        <Typography>{item.produto.nome}</Typography>
                      </Box>
                    }
                    secondary={`R$ ${(item.produto.precoVenda * item.quantidade).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">Subtotal: R$ {subtotal.toFixed(2)}</Typography>
              <TextField
                label="Desconto (R$)"
                type="number"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                fullWidth
                sx={{ mt: 1 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  label="Forma de Pagamento"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                  <MenuItem value="CREDITO">Crédito</MenuItem>
                  <MenuItem value="DEBITO">Débito</MenuItem>
                  <MenuItem value="PIX">PIX</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                Total: R$ {total.toFixed(2)}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={finalizarVenda}
                disabled={carrinho.length === 0}
              >
                Finalizar Venda
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
