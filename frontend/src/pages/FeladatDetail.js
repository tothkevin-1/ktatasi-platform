import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import { 
    Typography, 
    CircularProgress, 
    Box, 
    Paper, 
    TextField, 
    Button, 
    Divider, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar, 
    Avatar,
    Collapse,
    IconButton,
    Alert,
    AlertTitle
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, CheckCircle, Cancel } from '@mui/icons-material';
import { RadioGroup, FormControlLabel, Radio, Chip } from '@mui/material';

// --- 0. KOMPONENS: KVÍZ BEADÁSI ŰRLAP ---
const KvizUrlap = ({ feladat, handleBeadas }) => {
    const [valaszok, setValaszok] = useState({});
    const kerdesek = feladat.kviz_kerdesek || [];

    const onBeadas = (e) => {
        e.preventDefault();
        handleBeadas(JSON.stringify(valaszok), true);
    };

    return (
        <Box component="form" onSubmit={onBeadas} sx={{ mt: 1 }}>
            <Typography variant="h5" gutterBottom>Kvíz kitöltése</Typography>
            {kerdesek.map((k, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography fontWeight="bold">{i + 1}. {k.kerdes}</Typography>
                    <RadioGroup value={valaszok[i] || ''} onChange={(e) => setValaszok(prev => ({ ...prev, [i]: e.target.value }))}>
                        {['a', 'b', 'c', 'd'].map(b => (
                            <FormControlLabel key={b} value={b} control={<Radio />}
                                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={b.toUpperCase()} size="small" />{k.valaszok[b]}
                                </Box>}
                            />
                        ))}
                    </RadioGroup>
                </Paper>
            ))}
            <Button type="submit" variant="contained" disabled={Object.keys(valaszok).length < kerdesek.length} sx={{ mt: 1 }}>
                Beadás
            </Button>
        </Box>
    );
};

// --- 1. KOMPONENS: DIÁK BEADÁSI ŰRLAP ---
const DiakBeadasiUrlap = ({ handleBeadas, szovegesValasz, setSzovegesValasz }) => (
  <Box component="form" onSubmit={handleBeadas} sx={{ mt: 1 }}>
    <Typography variant="h5" gutterBottom>Beadás</Typography>
    <TextField
      margin="normal"
      required
      fullWidth
      multiline
      rows={6}
      id="szoveges_valasz"
      label="Válasz"
      name="szoveges_valasz"
      value={szovegesValasz}
      onChange={(e) => setSzovegesValasz(e.target.value)}
    />
    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
      Feladat Beadása
    </Button>
  </Box>
);

// --- 2. KOMPONENS: DIÁK SAJÁT BEADÁSÁNAK MEGTEKINTÉSE ---
const DiakBeadasaNezet = ({ beadas }) => {
    const [aiErtekeles, setAiErtekeles] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    const handleAiErtekeles = async () => {
        setAiLoading(true);
        try {
            const response = await axiosInstance.post('/ai-ertekeles/', { beadas_id: beadas.id });
            setAiErtekeles(response.data.ertekeles);
        } catch {
            setAiErtekeles('Hiba történt az AI értékelés során.');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>Saját Beadott Munkád</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Beadás dátuma: {new Date(beadas.beadas_datuma).toLocaleString('hu-HU')}
                </Typography>
                <Typography variant="body1" sx={{ my: 2, whiteSpace: 'pre-wrap' }}>
                    {beadas.szoveges_valasz}
                </Typography>

                {beadas.erdemjegy ? (
                    <Alert severity="success">
                        <AlertTitle>Értékelés</AlertTitle>
                        <Typography variant="h6">Érdemjegy: {beadas.erdemjegy}</Typography>
                        {beadas.tanari_visszajelzes && (
                            <Typography sx={{ mt: 1 }}>
                                <strong>Tanári visszajelzés:</strong> {beadas.tanari_visszajelzes}
                            </Typography>
                        )}
                    </Alert>
                ) : (
                    <Alert severity="info">A munkád még nincs értékelve.</Alert>
                )}

                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={handleAiErtekeles}
                        disabled={aiLoading}
                        startIcon={aiLoading ? <CircularProgress size={16} /> : null}
                    >
                        {aiLoading ? 'AI elemez...' : 'AI visszajelzés kérése'}
                    </Button>
                    {aiErtekeles && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <AlertTitle>AI visszajelzés</AlertTitle>
                            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{aiErtekeles}</Typography>
                        </Alert>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

// --- 3. KOMPONENS: TANÁRI NÉZET (LISTA) ---
const TanariBeadasokLista = ({ beadasok, setBeadasok }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [erdemjegy, setErdemjegy] = useState('');
  const [visszajelzes, setVisszajelzes] = useState('');
  const [aiJavaslatok, setAiJavaslatok] = useState({});
  const [aiLoading, setAiLoading] = useState(null);

  const handleExpandClick = (beadas) => {
    const beadasId = beadas.id;
    if (expandedId === beadasId) {
        setExpandedId(null);
    } else {
        setExpandedId(beadasId);
        setErdemjegy(beadas.erdemjegy || '');
        setVisszajelzes(beadas.tanari_visszajelzes || '');
    }
  };

  const handleAiJavaslat = async (beadasId) => {
    setAiLoading(beadasId);
    try {
        const response = await axiosInstance.post('/ai-ertekeles/', { beadas_id: beadasId });
        setAiJavaslatok(prev => ({ ...prev, [beadasId]: response.data.ertekeles }));
    } catch {
        setAiJavaslatok(prev => ({ ...prev, [beadasId]: 'Hiba az AI értékelés során.' }));
    } finally {
        setAiLoading(null);
    }
  };

  const handleErtekelesSubmit = async (beadasId) => {
    try {
        const response = await axiosInstance.patch(`/beadasok/${beadasId}/ertekel/`, {
            erdemjegy: erdemjegy,
            tanari_visszajelzes: visszajelzes
        });
        if (response.status === 200) {
            alert('Értékelés elmentve!');
            const frissitettBeadasok = beadasok.map(b => b.id === beadasId ? response.data : b);
            setBeadasok(frissitettBeadasok);
            setExpandedId(null); 
        }
    } catch (error) {
        console.error("Hiba az értékelés mentésekor", error);
        alert("Hiba történt az értékelés mentésekor.");
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>Beadott Munkák</Typography>
      {beadasok && beadasok.length > 0 ? (
        <List sx={{ bgcolor: 'background.paper' }}>
          {beadasok.map(beadas => (
            <React.Fragment key={beadas.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{beadas.diak.first_name ? `${beadas.diak.first_name[0]}${beadas.diak.last_name[0]}` : '??'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${beadas.diak.first_name} ${beadas.diak.last_name} - Jegy: ${beadas.erdemjegy || 'N/A'}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                        Beadás dátuma: {new Date(beadas.beadas_datuma).toLocaleString('hu-HU')}
                      </Typography>
                      {beadas.szoveges_valasz}
                    </>
                  }
                />
                <IconButton onClick={() => handleExpandClick(beadas)}>
                    <ExpandMoreIcon />
                </IconButton>
              </ListItem>
              <Collapse in={expandedId === beadas.id} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, ml: 7, borderLeft: '2px solid #eee' }}>
                  <Typography variant="h6">Értékelés</Typography>
                  <TextField label="Érdemjegy (1-10)" type="number" value={erdemjegy} onChange={e => setErdemjegy(e.target.value)} fullWidth margin="normal" />
                  <TextField label="Szöveges visszajelzés" multiline rows={3} value={visszajelzes} onChange={e => setVisszajelzes(e.target.value)} fullWidth margin="normal" />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button variant="contained" onClick={() => handleErtekelesSubmit(beadas.id)}>Mentés</Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleAiJavaslat(beadas.id)}
                        disabled={aiLoading === beadas.id}
                        startIcon={aiLoading === beadas.id ? <CircularProgress size={16} /> : null}
                    >
                        {aiLoading === beadas.id ? 'AI elemez...' : 'AI javaslat'}
                    </Button>
                  </Box>
                  {aiJavaslatok[beadas.id] && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle>AI értékelési javaslat</AlertTitle>
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{aiJavaslatok[beadas.id]}</Typography>
                    </Alert>
                  )}
                </Box>
              </Collapse>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography>Még senki nem adott be munkát ehhez a feladathoz.</Typography>
      )}
    </Box>
  );
};

// --- 4. FŐ KOMPONENS ---
function FeladatDetail() {
  const { notify } = useContext(NotificationContext);
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [feladat, setFeladat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [szovegesValasz, setSzovegesValasz] = useState('');

  useEffect(() => {
    axiosInstance.get(`/feladatok/${id}/`)
      .then(response => {
        setFeladat(response.data);
        setLoading(false);
      })
      .catch(error => { 
        console.error("Hiba a feladat adatainak lekérése közben!", error); 
        setLoading(false); 
      });
  }, [id]);

  const handleBeadas = async (szoveg, kviz = false) => {
    const valasz = kviz ? szoveg : szovegesValasz;
    if (!kviz && !valasz.trim()) { return notify("A válasz nem lehet üres!", "warning"); }
    try {
      const response = await axiosInstance.post('/beadasok/', { feladat: id, szoveges_valasz: valasz });
      if (response.status === 201) {
        notify("Sikeres beadás!", "success");
        setFeladat(prev => ({ ...prev, beadasok: [...prev.beadasok, response.data] }));
      }
    } catch (error) {
      const uzenet = error.response?.data?.[0] || error.response?.data?.detail || "Hiba történt a beadás során.";
      notify(uzenet, "error");
    }
  };
  
  const setBeadasok = (frissitettBeadasok) => {
    setFeladat(prevFeladat => ({ ...prevFeladat, beadasok: frissitettBeadasok }));
  };

  if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>; }
  if (!feladat) { return <Typography>A feladat betöltése nem sikerült vagy nem található.</Typography>; }

  const sajatBeadas = user ? feladat.beadasok.find(b => b.diak.id === user.user_id) : null;
  const lejart = new Date(feladat.hatarido) < new Date();
  const hatarido = new Date(feladat.hatarido);
  const hatarido_szin = lejart ? 'text.disabled' : 'error.main';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{feladat.cim}</Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{feladat.leiras}</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="subtitle1" color={hatarido_szin}>
          Határidő: {hatarido.toLocaleString('hu-HU')}
        </Typography>
        {lejart && (
          <Chip label="Lejárt" color="default" size="small" />
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {user && user.role === 'tanar' ? (
        <TanariBeadasokLista beadasok={feladat.beadasok} setBeadasok={setBeadasok} />
      ) : sajatBeadas ? (
        <DiakBeadasaNezet beadas={sajatBeadas} />
      ) : lejart ? (
        <Alert severity="warning">
          <AlertTitle>A beadási határidő lejárt</AlertTitle>
          Ez a feladat már nem adható be. A határidő {hatarido.toLocaleString('hu-HU')} volt.
        </Alert>
      ) : feladat.tipus === 'kviz' ? (
        <KvizUrlap feladat={feladat} handleBeadas={handleBeadas} />
      ) : (
        <DiakBeadasiUrlap
          handleBeadas={(e) => { e.preventDefault(); handleBeadas(szovegesValasz); }}
          szovegesValasz={szovegesValasz}
          setSzovegesValasz={setSzovegesValasz}
        />
      )}
    </Paper>
  );
}

export default FeladatDetail;