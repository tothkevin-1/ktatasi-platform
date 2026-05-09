import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import { 
    Typography, 
    CircularProgress, 
    Box, 
    Paper, 
    List, 
    ListItem, 
    ListItemText, 
    Divider,
    ListItemButton,
    Button,
    Modal,
    TextField,
    Fab,
    Chip,
    Stack,
    Collapse,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AssessmentIcon from '@mui/icons-material/Assessment';
import JegyEloszlasDiagram from '../components/JegyEloszlasDiagram';

// Ikonok a szerkesztéshez és törléshez
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function KurzusDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [kurzus, setKurzus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [cim, setCim] = useState('');
  const [leiras, setLeiras] = useState('');
  const [hatarido, setHatarido] = useState('');

  // Új state-ek a szerkesztéshez
  const [editingFeladatId, setEditingFeladatId] = useState(null); // Annak a feladatnak az ID-ja, amit szerkesztünk
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/kurzusok/${id}/`)
      .then(response => { setKurzus(response.data); setLoading(false); })
      .catch(error => { console.error("Hiba!", error); setLoading(false); });
  }, [id]);

  const handleOpenModal = () => {
    setEditingFeladatId(null); // Létrehozás mód
    setCim(''); setLeiras(''); setHatarido(''); // Üjítjük az űrlapot
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  // EZ A FÜGGVÉNY most már létrehozásra ÉS szerkesztésre is alkalmas
  const handleSubmitFeladat = async (e) => {
    e.preventDefault();
    try {
        const feladatData = {
            kurzus_id: id,
            cim: cim,
            leiras: leiras,
            hatarido: new Date(hatarido).toISOString(),
        };

        let response;
        if (editingFeladatId) {
            // Szerkesztés mód (PATCH kérés)
            response = await axiosInstance.patch(`/feladatok/${editingFeladatId}/`, feladatData);
        } else {
            // Létrehozás mód (POST kérés)
            response = await axiosInstance.post('/feladatok/', feladatData);
        }

        if (response.status === 201 || response.status === 200) {
            // Frissítjük a feladatok listáját a state-ben
            setKurzus(prevKurzus => {
                if (editingFeladatId) {
                    // Kicseréljük a szerkesztett feladatot a frissel
                    return {
                        ...prevKurzus,
                        feladatok: prevKurzus.feladatok.map(f => f.id === editingFeladatId ? response.data : f)
                    };
                } else {
                    // Hozzáadjuk az új feladatot
                    return {
                        ...prevKurzus,
                        feladatok: [...prevKurzus.feladatok, response.data]
                    };
                }
            });
            handleCloseModal(); // Bezárjuk a modalt
            // Itt jöhetne egy snackbar értesítés
        }
    } catch (error) {
        console.error("Hiba a feladat kezelésekor!", error);
        // Itt jöhetne egy snackbar értesítés
    }
  };

  // ÚJ FÜGGVÉNY A SZERKESZTÉS MEGNYITÁSÁHOZ
  const handleEditFeladat = (feladat) => {
    setEditingFeladatId(feladat.id); // Beállítjuk, hogy szerkesztés mód van
    setCim(feladat.cim);
    setLeiras(feladat.leiras);
    // A határidőt speciálisan kell formázni az input mezőhöz
    setHatarido(new Date(feladat.hatarido).toISOString().slice(0, 16));
    setOpenModal(true);
  };

  // ÚJ FÜGGVÉNY A TÖRLÉSHEZ
  const handleDeleteFeladat = async (feladatId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a feladatot?')) {
        try {
            await axiosInstance.delete(`/feladatok/${feladatId}/`);
            // Eltávolítjuk a feladatot a listából
            setKurzus(prevKurzus => ({
                ...prevKurzus,
                feladatok: prevKurzus.feladatok.filter(f => f.id !== feladatId)
            }));
            // Itt jöhetne egy snackbar értesítés
        } catch (error) {
            console.error("Hiba a feladat törlésekor!", error);
            // Itt jöhetne egy snackbar értesítés
        }
    }
  };


  if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>; }
  if (!kurzus) { return <Typography>A kurzus nem található.</Typography>; }

  return (
    <Paper sx={{ p: 3 }}>
      <>
        {/* ... Kurzus adatai ... */}

        {user.role === 'tanar' && kurzus.feladatok && kurzus.feladatok.length > 0 && (
            <>
                <Button variant="outlined" startIcon={<AssessmentIcon />} onClick={() => setStatsOpen(!statsOpen)} sx={{ mt: 2 }}>
                    Feladat Statisztikák {statsOpen ? 'Elrejtése' : 'Megjelenítése'}
                </Button>
                <Collapse in={statsOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 3 }}>
                        {kurzus.feladatok.map(feladat => (
                            <Box key={feladat.id} sx={{ mb: 4 }}>
                                <Typography variant="h6">{feladat.cim}</Typography>
                                <JegyEloszlasDiagram data={feladat.jegy_eloszlas} />
                            </Box>
                        ))}
                    </Box>
                </Collapse>
            </>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>Feladatok</Typography>
          {user.role === 'tanar' && (
            <Fab color="primary" size="small" aria-label="add" onClick={handleOpenModal}>
              <AddIcon />
            </Fab>
          )}
        </Box>
        
        {kurzus.feladatok && kurzus.feladatok.length > 0 ? (
          <List>
            {kurzus.feladatok.map((feladat, index) => (
              <React.Fragment key={feladat.id}>
                <ListItemButton component={RouterLink} to={`/feladat/${feladat.id}`}>
                  <ListItemText primary={feladat.cim} secondary={`Határidő: ${new Date(feladat.hatarido).toLocaleDateString('hu-HU')}`}/>
                  {user.role === 'tanar' && (
                      <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                          {/* SZERKESZTÉS ÉS TÖRLÉS IKONOK */}
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleEditFeladat(feladat); }}>
                              <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteFeladat(feladat.id); }}>
                              <DeleteIcon fontSize="small" />
                          </IconButton>
                          
                          {/* Statisztikai címkék */}
                          <Chip icon={<CheckCircleIcon />} label={`${feladat.beadasok_szama} beadás`} variant="outlined" size="small" />
                          <Chip icon={<StarBorderIcon />} label={`Átlag: ${feladat.jegyek_atlaga}`} variant="outlined" size="small" color="primary" />
                      </Stack>
                  )}
                </ListItemButton>
                {index < kurzus.feladatok.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : ( <Typography sx={{ mt: 2 }}>Ehhez a kurzushoz még nincsenek feladatok.</Typography> )}
      </>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleSubmitFeladat}>
          <Typography variant="h6" component="h2">
            {editingFeladatId ? 'Feladat Szerkesztése' : 'Új Feladat Létrehozása'}
          </Typography>
          <TextField margin="normal" required fullWidth label="Feladat Címe" value={cim} onChange={e => setCim(e.target.value)} />
          <TextField margin="normal" required fullWidth multiline rows={4} label="Leírás" value={leiras} onChange={e => setLeiras(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Határidő" type="datetime-local" value={hatarido} onChange={e => setHatarido(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {editingFeladatId ? 'Mentés' : 'Létrehozás'}
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
}
export default KurzusDetail;