import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  CssBaseline,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';

import PDV from './PDV';
import Relatorios from './Relatorios';
import CaixaManager from './CaixaManager';
import Produtos from './Produtos';
import Fornecedores from './Fornecedores';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('pdv');
  const { logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleChangeAba = (aba) => {
    setAbaAtiva(aba);
    setMobileOpen(false);
  };

  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'pdv':
        return <PDV />;
      case 'caixa':
        return <CaixaManager />;
      case 'produtos':
        return <Produtos />;
      case 'fornecedores':
        return <Fornecedores />;
      case 'relatorios':
        return <Relatorios />;
      default:
        return <PDV />;
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          POS PDV
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItemButton selected={abaAtiva === 'pdv'} onClick={() => handleChangeAba('pdv')}>
          <PointOfSaleIcon sx={{ mr: 1 }} />
          <ListItemText primary="PDV" />
        </ListItemButton>

        <ListItemButton selected={abaAtiva === 'caixa'} onClick={() => handleChangeAba('caixa')}>
          <AccountBalanceWalletIcon sx={{ mr: 1 }} />
          <ListItemText primary="Caixa" />
        </ListItemButton>

        <ListItemButton selected={abaAtiva === 'produtos'} onClick={() => handleChangeAba('produtos')}>
          <InventoryIcon sx={{ mr: 1 }} />
          <ListItemText primary="Produtos" />
        </ListItemButton>

        <ListItemButton selected={abaAtiva === 'fornecedores'} onClick={() => handleChangeAba('fornecedores')}>
          <InventoryIcon sx={{ mr: 1 }} />
          <ListItemText primary="Fornecedores" />
        </ListItemButton>

        <ListItemButton selected={abaAtiva === 'relatorios'} onClick={() => handleChangeAba('relatorios')}>
          <AssessmentIcon sx={{ mr: 1 }} />
          <ListItemText primary="Relatórios" />
        </ListItemButton>
      </List>

      <Divider />
      <List>
        <ListItemButton onClick={logout}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </div>

    
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Sistema POS - {abaAtiva.toUpperCase()}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="menu pastas"
      >
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {renderConteudo()}
      </Box>
    </Box>
  );
}
