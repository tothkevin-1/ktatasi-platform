import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useTranslation } from 'react-i18next'; // <-- FORDÍTÓ IMPORT
import { 
    Typography, CircularProgress, Box, Paper, Grid, Divider, Tooltip, Avatar 
} from '@mui/material';

function JegyekPage() {
  const [jegyekData, setJegyekData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(); // <-- Inicializálás

  useEffect(() => {
    axiosInstance.get('/jegyek/')
      .then(response => { setJegyekData(response.data); setLoading(false); })
      .catch(error => { console.error("Hiba!", error); setLoading(false); });
  },[]);

  const getGradeColor = (jegy) => {
      if (jegy >= 9) return '#4caf50';
      if (jegy >= 7) return '#2196f3';
      if (jegy >= 5) return '#ff9800';
      return '#f44336';
  };

  let osszatlag = 0;
  if (jegyekData.length > 0) {
      const atlagOsszeg = jegyekData.reduce((szumma, kurzus) => szumma + parseFloat(kurzus.atlag), 0);
      osszatlag = (atlagOsszeg / jegyekData.length).toFixed(2);
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, minHeight: '80vh' }}>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
                {t('digitalis_naplo')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
                {t('naplo_leiras')}
            </Typography>
          </Box>

          {jegyekData.length > 0 && (
              <Paper elevation={4} sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', textAlign: 'center', minWidth: '180px', borderRadius: 2 }}>
                  <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.8 }}>
                      {t('tanulmanyi_osszatlag')}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                      {osszatlag}
                  </Typography>
              </Paper>
          )}
      </Box>

      {jegyekData.length > 0 ? (
        jegyekData.map((kurzus, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Grid container alignItems="center" spacing={2}>
              
              <Grid item xs={12} md={3}>
                <Typography variant="h6">{kurzus.tantargy_nev}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {kurzus.kurzus_nev} <br /> {t('tanar')}: {kurzus.tanar_nev}
                </Typography>
              </Grid>

              <Grid item xs={12} md={7} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {kurzus.jegyek.map((jegy, i) => (
                  <Tooltip 
                    key={i} 
                    title={
                        <React.Fragment>
                            <Typography variant="subtitle2">{jegy['feladat__cim']}</Typography>
                            {jegy.datum && <Typography variant="caption" display="block">{t('datum')} {jegy.datum}</Typography>}
                            {jegy.tanari_visszajelzes && (
                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                    "{jegy.tanari_visszajelzes}"
                                </Typography>
                            )}
                        </React.Fragment>
                    } 
                    arrow
                  >
                    <Avatar sx={{ bgcolor: getGradeColor(jegy.erdemjegy), width: 45, height: 45, cursor: 'pointer', fontWeight: 'bold', fontSize: '1.3rem', boxShadow: 2, '&:hover': { opacity: 0.8, transform: 'scale(1.1)', transition: 'all 0.2s ease-in-out' } }}>
                      {jegy.erdemjegy}
                    </Avatar>
                  </Tooltip>
                ))}
              </Grid>

              <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {t('atlag')}: {kurzus.atlag}
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ mt: 3 }} />
          </Box>
        ))
      ) : (
        <Typography sx={{ mt: 3, color: 'text.secondary' }}>{t('nincs_jegy')}</Typography>
      )}
    </Paper>
  );
}

export default JegyekPage;