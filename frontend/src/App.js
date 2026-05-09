import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box, createTheme, ThemeProvider, CssBaseline, Grid, Snackbar, Alert } from '@mui/material';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContext from './context/NotificationContext';
import AuthContext, { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Sidebar from './components/Sidebar'; // <-- ÚJ IMPORT
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Kurzusaim from './pages/Kurzusaim';
import LoginPage from './pages/LoginPage';
import KurzusDetail from './pages/KurzusDetail';
import FeladatDetail from './pages/FeladatDetail';
import RanglistaPage from './pages/RanglistaPage';
import ProfilPage from './pages/ProfilPage';
import BeallitasokPage from './pages/BeallitasokPage';
import HirekPage from './pages/HirekPage';
import JegyekPage from './pages/JegyekPage';
import AiAsszisztensPage from './pages/AiAsszisztensPage';
import AiChatWidget from './components/AiChatWidget';
import ChatPage from './pages/ChatPage';
import DolgozatPage from './pages/DolgozatPage';

const AppContent = () => {
  const { mode, user } = useContext(AuthContext);
  const { notification } = useContext(NotificationContext); // Elkérjük a user-t is, hogy tudjuk, mikor mutassuk a sidebart
  const theme = React.useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        
        {/* A tartalom kitágítva (maxWidth="xl"), hogy legyen hely a sidebarnak */}
        <Container component="main" maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Grid container spacing={4}>
            
            {/* BAL OLDALI SÁV (Csak bejelentkezés után látszik) */}
            {user && (
              <Grid item xs={12} md={3} lg={2.5}>
                <Sidebar />
              </Grid>
            )}

            {/* JOBB OLDAL / FŐ TARTALOM (Ha nincs bejelentkezve, középre kerül) */}
            <Grid item xs={12} md={user ? 9 : 12} lg={user ? 9.5 : 12}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/kurzusaim" element={<Kurzusaim />} />
                  <Route path="/kurzus/:id" element={<KurzusDetail />} />
                  <Route path="/feladat/:id" element={<FeladatDetail />} />
                  <Route path="/ranglista" element={<RanglistaPage />} />
                  <Route path="/profil" element={<ProfilPage />} />
                  <Route path="/beallitasok" element={<BeallitasokPage />} />
                  <Route path="/hirek" element={<HirekPage />} />
                  <Route path="/jegyek" element={<JegyekPage />} />
                  <Route path="/ai-asszisztens" element={<AiAsszisztensPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/dolgozat" element={<DolgozatPage />} />
                </Route>
              </Routes>
            </Grid>
            
          </Grid>
        </Container>
      {user && <AiChatWidget />}

      <Snackbar open={!!notification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={notification?.severity || 'info'} variant="filled" sx={{ minWidth: 300 }}>
          {notification?.message}
        </Alert>
      </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;