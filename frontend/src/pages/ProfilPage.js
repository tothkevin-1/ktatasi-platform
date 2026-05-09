import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // <-- FORDÍTÓ IMPORT
import { 
    Typography, CircularProgress, Box, Paper, Grid, Avatar, Divider 
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function ProfilPage() {
  const { user } = useContext(AuthContext); 
  const [ranglista, setRanglista] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(); // <-- INICIALIZÁLÁS

  useEffect(() => {
    if (user && user.role === 'diak') {
        axiosInstance.get('/ranglista/')
          .then(response => {
            setRanglista(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.error("Hiba a ranglista lekérése közben!", error);
            setLoading(false);
          });
    } else {
        setLoading(false);
    }
  },[user]);

  if (!user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  const sajatHelyezes = user.role === 'diak' && ranglista.length > 0
    ? ranglista.findIndex(diak => diak.id === user.user_id) + 1
    : 0;

  // Szerepkör fordítása dinamikusan
  const getRoleTranslation = (role) => {
      if (role === 'diak') return t('szerepkor_diak');
      if (role === 'tanar') return t('szerepkor_tanar');
      return t('szerepkor_vezeto');
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
            {(user.first_name ? user.first_name[0] : user.username[0]).toUpperCase()}
          </Avatar>
        </Grid>
        <Grid item>
          <Typography variant="h4">{user.first_name || user.username}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {getRoleTranslation(user.role)} {/* FORDÍTOTT SZEREPKÖR */}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {user.role === 'diak' && (
        <Box>
            <Typography variant="h5" gutterBottom>{t('teljesitmeny')}</Typography> {/* FORDÍTOTT */}
            {loading ? <CircularProgress /> : (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <StarIcon color="warning" sx={{ fontSize: 40 }}/>
                            <Box>
                                <Typography variant="h6">{user.pontszam} {t('pont')}</Typography> {/* FORDÍTOTT */}
                                <Typography color="text.secondary">{t('osszegyujtott_pontok')}</Typography> {/* FORDÍTOTT */}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <EmojiEventsIcon color="secondary" sx={{ fontSize: 40 }}/>
                            <Box>
                                <Typography variant="h6">
                                    {/* FORDÍTOTT HELYEZÉS */}
                                    {sajatHelyezes > 0 ? `${sajatHelyezes}. ${t('hely')}` : t('nincs_top10')}
                                </Typography>
                                <Typography color="text.secondary">{t('helyezes_ranglistan')}</Typography> {/* FORDÍTOTT */}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
      )}

    </Paper>
  );
}

export default ProfilPage;