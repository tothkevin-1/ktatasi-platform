import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, createTheme, ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContext from './context/NotificationContext';
import AuthContext, { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
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
import MiniNaptar from './components/MiniNaptar';
import ChatPage from './pages/ChatPage';
import DolgozatPage from './pages/DolgozatPage';
import NaptarPage from './pages/NaptarPage';
import HianyzasPage from './pages/HianyzasPage';
import TanarNaploPage from './pages/TanarNaploPage';

const AppContent = () => {
  const { mode, user } = useContext(AuthContext);
  const { notification } = useContext(NotificationContext);
  const theme = React.useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        {/* Teljes szélességű tartalom — flexbox layout */}
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexGrow: 1,
            gap: 2,
            px: { xs: 1, sm: 2, md: 3 },
            py: { xs: 2, md: 3 },
            alignItems: 'flex-start',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* BAL OLDALI SÁV */}
          {user && (
            <Box sx={{ width: 200, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'sticky', top: 20 }}>
                <Sidebar />
              </Box>
            </Box>
          )}

          {/* FŐ TARTALOM */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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
                <Route path="/naptar" element={<NaptarPage />} />
                <Route path="/hianyzasok" element={<HianyzasPage />} />
                <Route path="/tanar-naplo" element={<TanarNaploPage />} />
              </Route>
            </Routes>
          </Box>

          {/* JOBB OLDALI SÁV — Mini naptár */}
          {user && (
            <Box sx={{ width: 230, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'sticky', top: 20 }}>
                <MiniNaptar />
              </Box>
            </Box>
          )}
        </Box>

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