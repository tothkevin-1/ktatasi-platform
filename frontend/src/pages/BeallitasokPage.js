import React, { useState, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Typography, Paper, Box, TextField, Button, Grid, Divider } from '@mui/material';
import NotificationContext from '../context/NotificationContext';
import { useTranslation } from 'react-i18next'; // <-- FORDÍTÓ IMPORT

function BeallitasokPage() {
  const { notify } = useContext(NotificationContext);
  const { t } = useTranslation(); // <-- INICIALIZÁLÁS

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      if (response.status === 200) {
        notify(t('jelszo_sikeres'), 'success'); // FORDÍTOTT ÉRTESÍTÉS
        setOldPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
      }
    } catch (error) {
      console.error("Hiba a jelszóváltoztatás során!", error.response.data);
      const errorMessage = Object.values(error.response.data).join(' ');
      notify(`${t('hiba')}: ${errorMessage}`, 'error'); // FORDÍTOTT ÉRTESÍTÉS
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        {t('beallitasok')} {/* FORDÍTOTT */}
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Box component="form" onSubmit={handleChangePassword} sx={{ mt: 3, maxWidth: '500px' }}>
        <Typography variant="h6" gutterBottom>
          {t('jelszo_megvaltoztatasa')} {/* FORDÍTOTT */}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              type="password" label={t('regi_jelszo')} required fullWidth autoComplete="current-password" // FORDÍTOTT
              value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="password" label={t('uj_jelszo')} required fullWidth autoComplete="new-password" // FORDÍTOTT
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="password" label={t('uj_jelszo_megerositese')} required fullWidth autoComplete="new-password" // FORDÍTOTT
              value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 3 }}>
          {t('jelszo_mentese')} {/* FORDÍTOTT */}
        </Button>
      </Box>
    </Paper>
  );
}

export default BeallitasokPage;