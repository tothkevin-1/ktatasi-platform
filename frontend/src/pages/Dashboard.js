import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; 
import { 
    Typography, CircularProgress, Box, Paper, Grid, Card, CardContent, CardActionArea, Divider 
} from '@mui/material';

// 1. DIÁK NÉZET
const DiakDashboard = ({ data }) => {
    const { t } = useTranslation();
    return (
        <Box>
            <Typography variant="h5" gutterBottom color="text.secondary">{t('kozelgo_hataridok')}</Typography>
            {data.kozelgo_feladatok && data.kozelgo_feladatok.length > 0 ? (
                <Grid container spacing={3}>
                    {data.kozelgo_feladatok.map(feladat => (
                        <Grid item xs={12} sm={6} md={4} key={feladat.id}>
                            <CardActionArea component={RouterLink} to={`/feladat/${feladat.id}`} sx={{ height: '100%', borderRadius: 2 }}>
                                <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'error.main', borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6">{feladat.cim}</Typography>
                                        <Typography color="error.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                                            {t('hatarido')}: {new Date(feladat.hatarido).toLocaleDateString('hu-HU')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </CardActionArea>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent' }}>
                    <Typography color="text.secondary">{t('nincs_kozelgo_feladat')}</Typography>
                </Paper>
            )}
        </Box>
    );
};

// 2. TANÁR NÉZET
const TanarDashboard = ({ data }) => {
    const { t } = useTranslation();
    return (
        <Box>
            <Typography variant="h5" gutterBottom color="text.secondary">{t('ertekelendo_kurzusok')}</Typography>
            {data.ertekelendo_kurzusok && data.ertekelendo_kurzusok.length > 0 ? (
                <Grid container spacing={3}>
                    {data.ertekelendo_kurzusok.map(kurzus => (
                        <Grid item xs={12} sm={6} md={4} key={kurzus.id}>
                            <CardActionArea component={RouterLink} to={`/kurzus/${kurzus.id}`} sx={{ height: '100%', borderRadius: 2 }}>
                                <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'warning.main', borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6">{kurzus.kurzus_neve}</Typography>
                                        <Typography variant="body1" color="warning.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                                            {kurzus.ertekelendo_count} {t('db_ertekelendo_beadas')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </CardActionArea>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent' }}>
                    <Typography color="text.secondary">{t('nincs_ertekelendo_beadas')}</Typography>
                </Paper>
            )}
        </Box>
    );
};

// --- FŐ KOMPONENS ---
function Dashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const[loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    axiosInstance.get('/dashboard/')
      .then(response => { setData(response.data); setLoading(false); })
      .catch(error => { console.error("Hiba!", error); setLoading(false); });
  },[user]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (!data) return <Typography>Hiba a betöltéskor.</Typography>;

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, minHeight: '80vh', bgcolor: 'background.default' }} elevation={0}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {t('udv')}, {user.first_name || user.username}!
      </Typography>
      <Divider sx={{ my: 3 }} />

      {/* ITT MÁR CSAK A SAJÁT TEENDŐK JELENNEK MEG, NINCS DUPLA DICSŐSÉGFAL */}
      {user.role === 'diak' && <DiakDashboard data={data} />}
      {user.role === 'tanar' && <TanarDashboard data={data} />}
      {user.role === 'vezeto' && <Typography color="text.secondary">{t('vezeto_fejlesztes_alatt')}</Typography>}
    </Paper>
  );
}

export default Dashboard;