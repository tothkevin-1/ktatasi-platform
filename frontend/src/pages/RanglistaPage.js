import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useTranslation } from 'react-i18next'; // FORDÍTÓ IMPORT
import { Typography, CircularProgress, Box, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';

function RanglistaPage() {
  const [ranglista, setRanglista] = useState([]);
  const[loading, setLoading] = useState(true);
  const { t } = useTranslation(); // FORDÍTÓ INICIALIZÁLÁSA

  useEffect(() => {
    axiosInstance.get('/ranglista/')
      .then(response => {
        setRanglista(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Hiba a ranglista lekérése közben!", error);
        setLoading(false);
      });
  },[]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t('ranglista_cim')} {/* FORDÍTOTT SZÖVEG */}
      </Typography>
      <List>
        {ranglista.length > 0 ? (
          ranglista.map((diak, index) => (
            <React.Fragment key={diak.id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: index < 3 ? 'secondary.main' : 'primary.main' }}>
                    {index + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${diak.first_name} ${diak.last_name}`}
                  secondary={`${diak.pontszam} ${t('pont')}`} // FORDÍTOTT SZÖVEG
                />
              </ListItem>
              {index < ranglista.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))
        ) : (
          <Typography>{t('nincs_ranglista_adat')}</Typography> // FORDÍTOTT SZÖVEG
        )}
      </List>
    </Paper>
  );
}

export default RanglistaPage;