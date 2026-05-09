import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // 1. Importáljuk a Link komponenst
import axiosInstance from '../utils/axiosInstance';
import { Card, CardActionArea, CardContent, Typography, CircularProgress, Box, Grid } from '@mui/material';

function Kurzusaim() {
  // ... a useState és useEffect rész változatlan ...
  const [kurzusok, setKurzusok] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axiosInstance.get('/kurzusok/')
      .then(response => {
        setKurzusok(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Hiba a kurzusok lekérése közben!", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Kurzusaim
      </Typography>
      
      {kurzusok.length > 0 ? (
        <Grid container spacing={3}>
          {kurzusok.map(kurzus => (
            <Grid item xs={12} sm={6} md={4} key={kurzus.id}>
              {/* 2. A CardActionArea komponens teszi az egész kártyát egyetlen nagy gombbá/linkké */}
              <CardActionArea component={RouterLink} to={`/kurzus/${kurzus.id}`} sx={{ height: '100%' }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {kurzus.kurzus_neve}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Tantárgy: {kurzus.tantargy.nev}
                    </Typography>
                    <Typography variant="body2">
                      Tanár: {kurzus.tanar.first_name} {kurzus.tanar.last_name}
                    </Typography>
                    <Typography variant="body2">
                      Beiratkozott diákok száma: {kurzus.diakok.length}
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>Nincsenek kurzusaid.</Typography>
      )}
    </div>
  );
}

export default Kurzusaim;