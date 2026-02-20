import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Fornecedores() {
  const { user } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '' });

  const carregarFornecedores = useCallback(async () => {
    try {
      const { data } = await api.get('/fornecedores');
      setFornecedores(data);
    } catch (err) {
      console.error("Erro ao carregar fornecedores", err);
    }
  }, []);

  useEffect(() => {
    if (user) carregarFornecedores();
  }, [user, carregarFornecedores]);

  const handleOpenNovo = () => {
    setEditingFornecedor(null);
    setForm({ nome: '', telefone: '', email: '' });
    setOpenDialog(true);
  };

  const handleOpenEditar = (f) => {
    setEditingFornecedor(f);
    setForm({ nome: f.nome, telefone: f.telefone || '', email: f.email || '' });
    setOpenDialog(true);
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Excluir este fornecedor? (Falhará se houver produtos vinculados)')) {
      try {
        await api.delete(`/fornecedores/${id}`);
        carregarFornecedores();
      } catch (err) {
        alert('Erro ao excluir: Verifique se existem produtos deste fornecedor.');
      }
    }
  };

  const salvar = async () => {
    try {
      if (editingFornecedor) {
        await api.put(`/fornecedores/${editingFornecedor.id}`, form);
      } else {
        await api.post('/fornecedores', form);
      }
      carregarFornecedores();
      setOpenDialog(false);
    } catch (err) {
      alert('Erro ao salvar fornecedor.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Fornecedores</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNovo}>
          Novo Fornecedor
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fornecedores.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.nome}</TableCell>
                  <TableCell>{f.telefone}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenEditar(f)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleExcluir(f.id)} color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFornecedor ? 'Editar' : 'Novo'} Fornecedor</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Nome" fullWidth value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} />
          <TextField margin="dense" label="CNPJ" fullWidth value={form.cnpj} onChange={(e) => setForm({...form, cnpj: e.target.value})} /> 
          <TextField margin="dense" label="Telefone" fullWidth value={form.telefone} onChange={(e) => setForm({...form, telefone: e.target.value})} />
          <TextField margin="dense" label="E-mail" fullWidth value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvar}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}