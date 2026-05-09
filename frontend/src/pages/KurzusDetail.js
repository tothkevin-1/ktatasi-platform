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
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormControlLabel,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import JegyEloszlasDiagram from '../components/JegyEloszlasDiagram';
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
  const [editingFeladatId, setEditingFeladatId] = useState(null);
  const [statsOpen, setStatsOpen] = useState(false);

  // Hiányzás state-ek
  const [hianyzasok, setHianyzasok] = useState([]);
  const [hianyzasModalOpen, setHianyzasModalOpen] = useState(false);
  const [hDiakId, setHDiakId] = useState('');
  const [hDatum, setHDatum] = useState(new Date().toISOString().slice(0, 10));
  const [hIgazolt, setHIgazolt] = useState(false);
  const [hMegjegyzes, setHMegjegyzes] = useState('');
  const [hianyzasokOpen, setHianyzasokOpen] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/kurzusok/${id}/`)
      .then(response => { setKurzus(response.data); setLoading(false); })
      .catch(error => { console.error("Hiba!", error); setLoading(false); });
    axiosInstance.get(`/hianyzasok/?kurzus=${id}`)
      .then(r => setHianyzasok(r.data))
      .catch(() => {});
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


  const handleHianyzasRogzit = async (e) => {
    e.preventDefault();
    try {
      const resp = await axiosInstance.post('/hianyzasok/', {
        diak_id: hDiakId,
        kurzus: id,
        datum: hDatum,
        igazolt: hIgazolt,
        megjegyzes: hMegjegyzes,
      });
      setHianyzasok(prev => [resp.data, ...prev]);
      setHianyzasModalOpen(false);
      setHDiakId(''); setHDatum(new Date().toISOString().slice(0, 10));
      setHIgazolt(false); setHMegjegyzes('');
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.[0] || 'Hiba a rögzítéskor.');
    }
  };

  const handleHianyzasTorles = async (hId) => {
    if (!window.confirm('Törlöd ezt a hiányzást?')) return;
    await axiosInstance.delete(`/hianyzasok/${hId}/`);
    setHianyzasok(prev => prev.filter(h => h.id !== hId));
  };

  const handleIgazolasToggle = async (h) => {
    const resp = await axiosInstance.patch(`/hianyzasok/${h.id}/`, { igazolt: !h.igazolt });
    setHianyzasok(prev => prev.map(x => x.id === h.id ? resp.data : x));
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

        {/* HIÁNYZÁSKEZELÉS — csak tanárnak */}
        {user.role === 'tanar' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<EventBusyIcon />}
                onClick={() => setHianyzasokOpen(p => !p)}
              >
                Hiányzások ({hianyzasok.length}) {hianyzasokOpen ? '▲' : '▼'}
              </Button>
              <Button variant="contained" color="warning" startIcon={<AddIcon />}
                onClick={() => setHianyzasModalOpen(true)}>
                Hiányzás rögzítése
              </Button>
            </Box>
            <Collapse in={hianyzasokOpen}>
              {hianyzasok.length === 0 ? (
                <Typography sx={{ mt: 2 }} color="text.secondary">Nincs rögzített hiányzás.</Typography>
              ) : (
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Diák</TableCell>
                      <TableCell>Dátum</TableCell>
                      <TableCell>Igazolt</TableCell>
                      <TableCell>Megjegyzés</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hianyzasok.map(h => (
                      <TableRow key={h.id}>
                        <TableCell>{h.diak.first_name} {h.diak.last_name}</TableCell>
                        <TableCell>{h.datum}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={h.igazolt ? 'Igazolt' : 'Igazolatlan'}
                            color={h.igazolt ? 'success' : 'error'}
                            onClick={() => handleIgazolasToggle(h)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>
                        <TableCell>{h.megjegyzes || '—'}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleHianyzasTorles(h.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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

      {/* Hiányzás rögzítő modal */}
      <Modal open={hianyzasModalOpen} onClose={() => setHianyzasModalOpen(false)}>
        <Box sx={modalStyle} component="form" onSubmit={handleHianyzasRogzit}>
          <Typography variant="h6" gutterBottom>Hiányzás rögzítése</Typography>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Diák</InputLabel>
            <Select value={hDiakId} label="Diák" onChange={e => setHDiakId(e.target.value)}>
              {(kurzus?.diakok || []).map(d => (
                <MenuItem key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.username})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal" required fullWidth type="date" label="Dátum"
            value={hDatum} onChange={e => setHDatum(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={<Checkbox checked={hIgazolt} onChange={e => setHIgazolt(e.target.checked)} />}
            label="Igazolt hiányzás"
          />
          <TextField
            margin="normal" fullWidth label="Megjegyzés (opcionális)"
            value={hMegjegyzes} onChange={e => setHMegjegyzes(e.target.value)}
          />
          <Button type="submit" variant="contained" color="warning" sx={{ mt: 2 }}>
            Rögzítés
          </Button>
        </Box>
      </Modal>

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