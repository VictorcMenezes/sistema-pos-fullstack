
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function Produtos() {
  const { open: snackOpen, message, severity, showSnackbar, closeSnackbar } = useSnackbar();
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [busca, setBusca] = useState('');
  const [precoMinimo, setPrecoMinimo] = useState('');
  const [precoMaximo, setPrecoMaximo] = useState('');
  const [form, setForm] = useState({
    nome: '',
    precoVenda: '',
    precoCompra: '',
    codigoBarras: '',
    fornecedorId: '',
    quantidadeInicial: 0
  });
  const [openEstoqueDialog, setOpenEstoqueDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [movimentacao, setMovimentacao] = useState({ quantidade: '', tipo: 'ENTRADA', motivo: '' });

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    filtrarProdutos();
  }, [produtos, busca, precoMinimo, precoMaximo]);

  const carregarProdutos = async () => {
    try {
      const { data } = await api.get('/produtos'); 
      setProdutos(data);
    } catch (err) {
      showSnackbar('Erro ao carregar produtos', 'error');
    }
  };

  const filtrarProdutos = () => {
    let resultado = produtos;

    if (busca) {
      resultado = resultado.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.codigoBarras?.includes(busca)
      );
    }

    if (precoMinimo) {
      resultado = resultado.filter(p => p.precoVenda >= Number(precoMinimo));
    }

    if (precoMaximo) {
      resultado = resultado.filter(p => p.precoVenda <= Number(precoMaximo));
    }

    setProdutosFiltrados(resultado);
  };

  const handleOpenNovo = () => {
    setEditingProduto(null);
    setForm({
      nome: '',
      precoVenda: '',
      precoCompra: '',
      codigoBarras: '',
      fornecedorId: '',
      quantidadeInicial: 0
    });
    setOpenDialog(true);
  };

  const handleOpenEditar = (produto) => {
    setEditingProduto(produto);
    setForm({
      nome: produto.nome,
      precoVenda: produto.precoVenda,
      precoCompra: produto.precoCompra || '',
      codigoBarras: produto.codigoBarras || '',
      fornecedorId: produto.fornecedorId || ''
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpenEstoque = (produto) => {
    setSelectedProduto(produto);
    setOpenEstoqueDialog(true);
  };

  const salvarProduto = async () => {

    if (!form.nome || !form.precoVenda || !form.fornecedorId || !form.precoCompra) {
      showSnackbar('Preencha todos os campos obrigatórios', 'warning');
      return;
    }
    try {
      const payload = {
        ...form,
        precoVenda: Number(form.precoVenda),
        precoCompra: Number(form.precoCompra),
        fornecedorId: Number(form.fornecedorId),
        quantidadeInicial: Number(form.quantidadeInicial || 0),
        ativo: editingProduto ? editingProduto.ativo : true
      };

     if (editingProduto) {
          await api.put(`/produtos/${editingProduto.id}`, payload);
          showSnackbar('Produto atualizado com sucesso', 'success');
      } else {  
          await api.post('/produtos', payload); 
          showSnackbar('Produto criado com sucesso', 'success');
      }

      await carregarProdutos();
      setOpenDialog(false);
    } catch (err) {
      showSnackbar('Erro ao salvar produto', 'error');
    }
  };

  const deletarProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await api.delete(`/produtos/${id}`);
      showSnackbar('Produto deletado com sucesso', 'success');
      await carregarProdutos();
    } catch (err) {
      showSnackbar('Erro ao deletar produto', 'error');
    }
  };

  const salvarMovimentacao = async () => {
    if (!movimentacao.quantidade || movimentacao.quantidade <= 0) {
      showSnackbar('Informe uma quantidade válida', 'warning');
      return;
    }

    try {
      const payload = {
        produtoId: selectedProduto.id,
        tipo: movimentacao.tipo,
        quantidade: Number(movimentacao.quantidade),
        motivo: movimentacao.motivo
      };


      await api.post('/estoque/movimentar', payload);

      showSnackbar('Estoque atualizado!', 'success');


      setMovimentacao({ quantidade: '', tipo: 'ENTRADA', motivo: '' });
      setOpenEstoqueDialog(false);


      await carregarProdutos();
    } catch (err) {

      const errorMsg = err.response?.data?.message || 'Erro ao atualizar estoque';
      showSnackbar(errorMsg, 'error');
    }
  };

  const [fornecedores, setFornecedores] = useState([]);

  useEffect(() => {
    carregarProdutos();
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    try {
      const { data } = await api.get('/fornecedores');
      setFornecedores(data);
    } catch (err) {
      showSnackbar('Erro ao carregar fornecedores', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Produtos</Typography>

      {/* Seção de Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Buscar nome ou código"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Preço Mín."
              type="number"
              value={precoMinimo}
              onChange={(e) => setPrecoMinimo(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Preço Máx."
              type="number"
              value={precoMaximo}
              onChange={(e) => setPrecoMaximo(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={handleOpenNovo}
            >
              Novo
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de produtos */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              {/* Cabeçalho da tabela */}
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Código de Barras</TableCell>
                <TableCell align="right">Estoque</TableCell>
                <TableCell align="right">Preço Venda</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtosFiltrados.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.nome}</TableCell>
                  <TableCell>
                    {p.codigoBarras ? (
                      <Chip label={p.codigoBarras} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={p.quantidadeInicial ?? 0}
                      color={(p.quantidadeInicial <= 5) ? "error" : "success"}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">R$ {Number(p.precoVenda).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEditar(p)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deletarProduto(p.id)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => handleOpenEstoque(p)}>
                      <InventoryIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {produtosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* criar/editar */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduto ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nome"
            name="nome"
            fullWidth
            value={form.nome}
            onChange={handleChange}
          />
          <TextField
            select
            margin="dense"
            label="Fornecedor"
            name="fornecedorId"
            fullWidth
            value={form.fornecedorId}
            onChange={handleChange}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Código de Barras"
            name="codigoBarras"
            fullWidth
            value={form.codigoBarras}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Preço de Compra (R$)"
            name="precoCompra"
            type="number"
            fullWidth
            value={form.precoCompra}
            onChange={handleChange}
            inputProps={{ step: '0.01' }}
            required
          />
          <TextField
            margin="dense"
            label="Preço de Venda (R$)"
            name="precoVenda"
            type="number"
            fullWidth
            value={form.precoVenda}
            onChange={handleChange}
            inputProps={{ step: '0.01' }}
            required
          />
          {!editingProduto && (
            <TextField
              margin="dense"
              label="Quantidade Inicial em Estoque"
              name="quantidadeInicial"
              type="number"
              fullWidth
              value={form.quantidadeInicial}
              onChange={handleChange}
              helperText="Esta quantidade será registrada na abertura do estoque deste produto."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={salvarProduto}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      {/*Movimentação de Estoque */}
      <Dialog open={openEstoqueDialog} onClose={() => setOpenEstoqueDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Movimentar Estoque: {selectedProduto?.nome}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Tipo de Movimentação"
              fullWidth
              value={movimentacao.tipo}
              onChange={(e) => setMovimentacao({ ...movimentacao, tipo: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="ENTRADA">Entrada (+)</option>
              <option value="SAIDA">Saída (-)</option>
              <option value="AJUSTE">Ajuste (Definir Valor Fixo)</option>
            </TextField>

            <TextField
              label={movimentacao.tipo === 'AJUSTE' ? "Novo Saldo Total" : "Quantidade"}
              type="number"
              fullWidth
              value={movimentacao.quantidade}
              onChange={(e) => setMovimentacao({ ...movimentacao, quantidade: e.target.value })}
            />

            <TextField
              label="Motivo / Observação"
              fullWidth
              multiline
              rows={2}
              value={movimentacao.motivo}
              onChange={(e) => setMovimentacao({ ...movimentacao, motivo: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEstoqueDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={salvarMovimentacao}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
