import React, { useState, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useTranslation } from 'react-router-dom'; // 1. Hook beimportálása, JAJ VÁRJ, ROSSZ IMPORT. Mindjárt javítom!
import { useTranslation as useI18nTranslation } from 'react-i18next'; // HELYES IMPORT!

import { 
    AppBar, Toolbar, Typography, Button, Box, Link, IconButton, Menu, MenuItem, Tooltip, Avatar, Divider 
} from '@mui/material';
import { 
    Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon, Translate as TranslateIcon 
} from '@mui/icons-material';

const Header = () => {
  let { user, logoutUser, mode, toggleColorMode } = useContext(AuthContext);
  
  // 2. Az i18n hook inicializálása
  const { t, i18n } = useI18nTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [langAnchorEl, setLangAnchorEl] = useState(null); // Új state a nyelvválasztó menünek

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { handleMenuClose(); logoutUser(); };

  // Nyelvválasztó kezelői
  const handleLangMenuOpen = (event) => setLangAnchorEl(event.currentTarget);
  const handleLangMenuClose = () => setLangAnchorEl(null);
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleLangMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="none">
            {t('oktatasi_platform')} {/* <-- A statikus szöveget lecseréltük a t() függvényre */}
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && (
              <>
                <Link component={RouterLink} to="/hirek" color="inherit" sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textDecoration: 'none', '&:hover': {textDecoration: 'underline'} }}>
                  {t('hirek')}
                </Link>
                {user.role === 'diak' && (
                  <Link component={RouterLink} to="/jegyek" color="inherit" sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textDecoration: 'none', '&:hover': {textDecoration: 'underline'} }}>
                    {t('jegyek')}
                  </Link>
                )}
                <Link component={RouterLink} to="/kurzusaim" color="inherit" sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textDecoration: 'none', '&:hover': {textDecoration: 'underline'} }}>
                  {t('kurzusaim')}
                </Link>
                <Link component={RouterLink} to="/ranglista" color="inherit" sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>
                  {t('ranglista')}
                </Link>
                <Link component={RouterLink} to="/chat" color="inherit" sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>
                  Chat
                </Link>
                <Link component={RouterLink} to="/dolgozat" color="inherit" sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>
                  Dolgozat
                </Link>
              </>
          )}

          {/* NYELVVÁLASZTÓ GOMB ÉS MENÜ */}
          <Tooltip title="Nyelv / Limbă / Language">
            <IconButton sx={{ ml: 1 }} onClick={handleLangMenuOpen} color="inherit">
              <TranslateIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={langAnchorEl}
            open={Boolean(langAnchorEl)}
            onClose={handleLangMenuClose}
          >
            <MenuItem onClick={() => changeLanguage('hu')} selected={i18n.language === 'hu'}>Magyar</MenuItem>
            <MenuItem onClick={() => changeLanguage('ro')} selected={i18n.language === 'ro'}>Română</MenuItem>
            <MenuItem onClick={() => changeLanguage('en')} selected={i18n.language === 'en'}>English</MenuItem>
          </Menu>

          {/* Sötét mód gomb */}
          <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {user ? (
            <>
              <Tooltip title="Fiók beállítások">
                <IconButton onClick={handleMenuOpen} color="inherit" sx={{ p: 0.5, ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {(user.first_name ? user.first_name[0] : user.username[0]).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu id="menu-appbar" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem component={RouterLink} to="/profil" onClick={handleMenuClose}>{t('profil')} ({user.first_name || user.username})</MenuItem>
                <MenuItem component={RouterLink} to="/beallitasok" onClick={handleMenuClose}>{t('beallitasok')}</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>{t('kijelentkezes')}</MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={RouterLink} to="/login" color="inherit" variant="outlined" sx={{ ml: 2 }}>
              {t('bejelentkezes')}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default Header;