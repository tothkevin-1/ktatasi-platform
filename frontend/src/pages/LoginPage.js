import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Paper, Box, TextField, Button, Typography } from '@mui/material';

// 1. BEIMPORTÁLJUK A FORDÍTÓ HOOK-OT
import { useTranslation } from 'react-i18next';

function LoginPage() {
  let { loginUser } = useContext(AuthContext);
  
  // 2. INICIALIZÁLJUK A 't' FÜGGVÉNYT
  const { t } = useTranslation();

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    loginUser(username, password);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 5 }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        {/* 3. LECSERÉLJÜK A STATIKUS SZÖVEGEKET A t('kulcs') FÜGGVÉNYRE */}
        <Typography variant="h4" component="h1" gutterBottom>
          {t('login_cim')}
        </Typography>
        <Box component="form" onSubmit={handleLogin}>
          <TextField 
            margin="normal" required fullWidth id="username" name="username" autoComplete="username" autoFocus 
            label={t('felhasznalonev')} /* <-- Itt is */
          />
          <TextField 
            margin="normal" required fullWidth name="password" type="password" id="password" autoComplete="current-password" 
            label={t('jelszo')} /* <-- Itt is */
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            {t('gomb_bejelentkezes')} {/* <-- És itt is */}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;