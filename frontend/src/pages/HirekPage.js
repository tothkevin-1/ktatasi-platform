import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { 
    Typography, CircularProgress, Box, Paper, Divider, Fab, Modal, TextField, Button 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '90%', maxWidth: 600, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

function HirekPage() {
  const { user } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);
  const { t } = useTranslation();
  
  const[hirek, setHirek] = useState([]);
  const [loading, setLoading] = useState(true);
  const[openModal, setOpenModal] = useState(false);
  const [cim, setCim] = useState('');
  const [tartalom, setTartalom] = useState('');

  useEffect(() => {
    axiosInstance.get('/hirek/')
      .then(response => { setHirek(response.data); setLoading(false); })
      .catch(error => { console.error("Hiba!", error); setLoading(false); });
  },[]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => { setOpenModal(false); setCim(''); setTartalom(''); };

  const handleCreateHir = async (e) => {
    e.preventDefault();
    if (!cim.trim() || !tartalom.trim()) {
        notify(t('minden_mezot_ki_kell_tolteni'), "warning");
        return;
    }

    try {
        const response = await axiosInstance.post('/hirek/', { cim, tartalom });
        if (response.status === 201) { 
            notify(t('hir_sikeresen_kozzeteve'), "success");
            setHirek([response.data, ...hirek]);
            handleCloseModal();
        }
    } catch (error) {
        console.error("Hiba a hír létrehozásakor!", error);
        notify(t('hir_hiba'), "error");
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">{t('hirek_cim')}</Typography>
        
        {user && (user.role === 'tanar' || user.role === 'vezeto') && (
          <Fab color="primary" aria-label="add" onClick={handleOpenModal}>
            <AddIcon />
          </Fab>
        )}
      </Box>
      
      <Divider sx={{ mb: 4 }} />

      {hirek.length > 0 ? (
        hirek.map((hir, index) => (
          <Box key={hir.id} sx={{ mt: 3 }}>
            <Typography variant="h5">{hir.cim}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('publikalva')}: {new Date(hir.letrehozas_datuma).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - 
              {t('szerzo')}: {hir.szerzo ? `${hir.szerzo.first_name} ${hir.szerzo.last_name}` : t('ismeretlen')}
            </Typography>
            <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{hir.tartalom}</Typography>
            {index < hirek.length - 1 && <Divider sx={{ my: 4 }} />}
          </Box>
        ))
      ) : (
        <Typography sx={{ mt: 3 }}>{t('nincsenek_hirek')}</Typography>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleCreateHir}>
          <Typography variant="h6" component="h2" gutterBottom>{t('uj_hir_kozzetetele')}</Typography>
          <TextField 
            margin="normal" required fullWidth label={t('hir_cime')}
            value={cim} onChange={e => setCim(e.target.value)} 
          />
          <TextField 
            margin="normal" required fullWidth multiline rows={6} label={t('tartalom')}
            value={tartalom} onChange={e => setTartalom(e.target.value)} 
          />
          <Button type="submit" variant="contained" sx={{ mt: 3 }} fullWidth>
            {t('kozzetetel')}
          </Button>
        </Box>
      </Modal>

    </Paper>
  );
}

export default HirekPage;