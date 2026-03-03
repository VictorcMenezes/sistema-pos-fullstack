import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Typography, List, ListItem,
  ListItemText, IconButton, Paper, Grid, MenuItem, Select,
  InputLabel, FormControl, Card, CardContent, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from '../hooks/useSnackbar';
import { Snackbar, Alert } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PDV() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState('');
  const [caixaId, setCaixaId] = useState(null);
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
  const [desconto, setDesconto] = useState(0);
  const { open, message, severity, showSnackbar, closeSnackbar } = useSnackbar();
  const [ultimaVenda, setUltimaVenda] = useState(null);
  const reciboRef = useRef(null);

  useEffect(() => {
    carregarProdutos();
    if (user?.id) {
      verificarCaixaAberto();
    }
  }, [user]);

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
      const { data } = await api.get(`/caixas/aberto/${user.id}`);
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

  const subtotal = carrinho.reduce((acc, item) =>
    acc + (item.produto.precoVenda * item.quantidade), 0
  );

  const total = Math.max(0, subtotal - (Number(desconto) || 0));

  const finalizarVenda = async () => {
    if (!caixaId) {
      showSnackbar('Nenhum caixa aberto!', 'warning');
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
      const { data } = await api.post('/vendas', {
        caixaId,
        usuarioId: user.id,
        itens,
        formaPagamento,
        desconto: Number(desconto) || 0
      });
      setUltimaVenda(data);
      showSnackbar('Venda realizada com sucesso!', 'success');
      setCarrinho([]);
      setDesconto(0);
      setFormaPagamento('DINHEIRO');
    } catch (err) {
      showSnackbar('Erro: ' + (err.response?.data?.error || 'Erro inesperado'), 'error');
    }
  };

  const handleImprimirRecibo = () => {
    if (!reciboRef.current) return;

    const janela = window.open('', '_blank', 'width=400,height=600');

    janela.document.write(`
    <html>
      <head>
        <title>Recibo Venda</title>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; padding: 10px; }
          }
          body { 
            font-family: 'monospace'; 
            width: 300px; 
            margin: 0; 
            padding: 10px;
            font-size: 12px;
          }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .flex-space { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        ${reciboRef.current.innerHTML}
        <script>
          window.onload = function() { 
            window.print(); 
            // Adicionamos um pequeno delay para fechar, ou comentamos para teste
            setTimeout(() => { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `);
    janela.document.close();
  };

  const handleExportarPDF = async () => {
    if (!reciboRef.current) return;
    const element = reciboRef.current;

    const canvas = await html2canvas(element, { scale: 3 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150]
    });

    pdf.addImage(imgData, 'PNG', 5, 5, 70, 0);
    pdf.save(`recibo-venda-${ultimaVenda?.id || 'venda'}.pdf`);
  };


  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (!caixaId) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>PDV - Ponto de Venda</Typography>
        <Card sx={{ backgroundColor: '#fff3cd', p: 2 }}>
          <Typography color="error" variant="h6">
            ⚠️ Nenhum caixa aberto para este usuário.
          </Typography>
          <Typography>Vá até a aba "Caixa" e realize a abertura antes de vender.</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>PDV - Ponto de Venda</Typography>

      <Grid container spacing={3}>
        {/* Lado Esquerdo: Busca e Produtos */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
            <TextField
              label="Qtd"
              type="number"
              value={quantidadeSelecionada}
              onChange={(e) => setQuantidadeSelecionada(Number(e.target.value))}
              sx={{ width: 100 }}
              inputProps={{ min: 1 }}
            />
          </Box>

          <List sx={{ maxHeight: 500, overflow: 'auto', mt: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            {produtosFiltrados.map(p => (
              <ListItem key={p.id} button onClick={() => adicionarItem(p)}>
                <ListItemText
                  primary={p.nome}
                  secondary={`Estoque: ${p.quantidadeEstoque ?? p.quantidadeInicial ?? 0} | R$ ${Number(p.precoVenda).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Lado Direito: Carrinho e Finalização */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Carrinho</Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {carrinho.map(item => (
                <ListItem key={item.produto.id} divider
                  secondaryAction={
                    <IconButton onClick={() => removerItem(item.produto.id)}><DeleteIcon /></IconButton>
                  }
                >
                  <ListItemText
                    primary={`${item.quantidade}x ${item.produto.nome}`}
                    secondary={`Subtotal: R$ ${(item.produto.precoVenda * item.quantidade).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <Typography>Subtotal: R$ {subtotal.toFixed(2)}</Typography>
              <TextField
                label="Desconto (R$)"
                type="number"
                fullWidth
                size="small"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                sx={{ my: 1 }}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Pagamento</InputLabel>
                <Select
                  value={formaPagamento}
                  label="Pagamento"
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                  <MenuItem value="CREDITO">Cartão de Crédito</MenuItem>
                  <MenuItem value="DEBITO">Cartão de Débito</MenuItem>
                  <MenuItem value="PIX">PIX</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Total: R$ {total.toFixed(2)}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
                onClick={finalizarVenda}
                disabled={carrinho.length === 0}
              >
                Finalizar Venda (F10)
              </Button>
            </Box>
          </Paper>

          {/* Recibo da Última Venda */}
          {ultimaVenda && (
            <Card variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Última Venda Realizada:</Typography>

              <Box
                ref={reciboRef}
                sx={{
                  p: 2,
                  bgcolor: 'white',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  maxWidth: '300px',
                  margin: '0 auto',
                  border: '1px solid #eee'
                }}
              >
                <Typography align="center" sx={{ fontWeight: 'bold' }}>COMPROVANTE DE VENDA</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>ID: {ultimaVenda.id}</Typography>
                <Typography>Data: {new Date(ultimaVenda.dataVenda).toLocaleString()}</Typography>
                <Typography>Atendente: {user?.nome}</Typography>
                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                {ultimaVenda.itens?.map((it, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">{it.quantidade}x {it.nomeProduto}</Typography>
                    <Typography variant="caption">R$ {(it.quantidade * it.precoUnitario).toFixed(2)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <Typography>TOTAL</Typography>
                  <Typography>R$ {Number(ultimaVenda.valorFinal).toFixed(2)}</Typography>
                </Box>
                <Typography variant="caption">Forma: {ultimaVenda.formaPagamento}</Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant="outlined" fullWidth onClick={handleImprimirRecibo}>Imprimir</Button>
                <Button variant="outlined" fullWidth onClick={handleExportarPDF}>PDF</Button>
                <Button color="error" onClick={() => setUltimaVenda(null)}>Fechar</Button>
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>

      <Snackbar open={open} autoHideDuration={3000} onClose={closeSnackbar}>
        <Alert severity={severity} onClose={closeSnackbar}>{message}</Alert>
      </Snackbar>
    </Box>
  );
}