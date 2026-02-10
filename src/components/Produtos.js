import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Produtos() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [form, setForm] = useState({ nome: '', precoVenda: '0', precoCompra: '0', codigoBarras: '', fornecedorId: '' });

  const carregarDados = useCallback(async () => {
    try {
      const resProd = await api.get('/produtos');
      setProdutos(resProd.data);
    } catch (err) {
      console.error("Erro nos produtos:", err);
      setProdutos([]); // Limpa a lista se der erro
    }
    try {
      const resForn = await api.get('/fornecedores');
      setFornecedores(resForn.data);
    } catch (err) {
      console.error("Erro nos fornecedores:", err);
    }
  }, []);

  useEffect(() => {
    if (user) carregarDados();
  }, [user, carregarDados]);

  const handleOpenNovo = () => {
    setEditingProduto(null);
    setForm({ nome: '', precoVenda: '', precoCompra: '', codigoBarras: '', fornecedorId: '' });
    setOpenDialog(true);
  };
  

  const salvarProduto = async () => {
  if (!form.fornecedorId) return alert("Selecione um fornecedor!");
  try {
    const payload = {
      nome: form.nome,
      precoVenda: Number(form.precoVenda),
      precoCompra: Number(form.precoCompra),
      codigoBarras: form.codigoBarras,
      fornecedorId: form.fornecedorId,
      ativo: true
    };
    
    if (editingProduto) {
      await api.put(`/produtos/${editingProduto.id}`, payload);
    } else {
      await api.post('/produtos', payload);
    }
    
    carregarDados();
    setOpenDialog(false);
  } catch (err) {
    alert('Erro: ' + (err.response?.data?.message || err.response?.data || 'Verifique os dados.'));
  }
};

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Produtos</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNovo}>Novo Produto</Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Fornecedor</TableCell>
                <TableCell>Cód. Barras</TableCell>
                <TableCell>Preço Compra</TableCell>
                <TableCell>Preço Venda</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nome}</TableCell>
                  <TableCell>{p.fornecedor?.nome || 'Não definido'}</TableCell>
                  <TableCell>{p.codigoBarras}</TableCell>
                  <TableCell>R$ {Number(p.precoCompra || 0).toFixed(2)}</TableCell>
                  <TableCell>R$ {Number(p.precoVenda).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => carregarDados()} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => api.delete(`/produtos/${p.id}`).then(carregarDados)} color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduto ? 'Editar' : 'Novo'} Produto</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Nome" fullWidth value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} />
          <TextField select margin="dense" label="Fornecedor" fullWidth value={form.fornecedorId} onChange={(e) => setForm({...form, fornecedorId: e.target.value})}>
            {fornecedores.map((f) => <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
          </TextField>
          <TextField margin="dense" label="Código de Barras" fullWidth value={form.codigoBarras} onChange={(e) => setForm({...form, codigoBarras: e.target.value})} />
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField label="Compra (R$)" type="number" fullWidth value={form.precoCompra} onChange={(e) => setForm({...form, precoCompra: e.target.value})} />
            <TextField label="Venda (R$)" type="number" fullWidth value={form.precoVenda} onChange={(e) => setForm({...form, precoVenda: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarProduto}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}