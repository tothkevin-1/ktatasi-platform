import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import {
    Box, Paper, Typography, CircularProgress, Select, MenuItem,
    FormControl, InputLabel, Table, TableHead, TableRow, TableCell,
    TableBody, Chip, Tabs, Tab, TextField, Button, Modal,
    FormControlLabel, Checkbox, IconButton, Tooltip
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const modalStyle = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 360, bgcolor: 'background.paper',
    boxShadow: 24, p: 4, borderRadius: 2,
};

const getGradeColor = (jegy) => {
    if (jegy >= 9) return '#4caf50';
    if (jegy >= 7) return '#2196f3';
    if (jegy >= 5) return '#ff9800';
    if (jegy >= 3) return '#ff5722';
    return '#f44336';
};

function TanarNaploPage() {
    const { user } = useContext(AuthContext);
    const [kurzusok, setKurzusok] = useState([]);
    const [kivalasztottId, setKivalasztottId] = useState('');
    const [kurzus, setKurzus] = useState(null);
    const [hianyzasok, setHianyzasok] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(0);

    // Jegy modal
    const [jegyModal, setJegyModal] = useState(false);
    const [jegyDiakId, setJegyDiakId] = useState(null);
    const [jegyFeladatId, setJegyFeladatId] = useState(null);
    const [jegyErtek, setJegyErtek] = useState('');
    const [jegyVissza, setJegyVissza] = useState('');
    const [jegyFeladatCim, setJegyFeladatCim] = useState('');
    const [jegyDiakNev, setJegyDiakNev] = useState('');

    // Hiányzás modal
    const [hModalOpen, setHModalOpen] = useState(false);
    const [hDiakId, setHDiakId] = useState('');
    const [hDatum, setHDatum] = useState(new Date().toISOString().slice(0, 10));
    const [hIgazolt, setHIgazolt] = useState(false);
    const [hMegjegyzes, setHMegjegyzes] = useState('');

    useEffect(() => {
        axiosInstance.get('/kurzusok/').then(r => {
            setKurzusok(r.data);
            if (r.data.length > 0) setKivalasztottId(r.data[0].id);
        });
    }, []);

    useEffect(() => {
        if (!kivalasztottId) return;
        setLoading(true);
        Promise.all([
            axiosInstance.get(`/kurzusok/${kivalasztottId}/`),
            axiosInstance.get(`/hianyzasok/?kurzus=${kivalasztottId}`),
        ]).then(([kRes, hRes]) => {
            setKurzus(kRes.data);
            setHianyzasok(hRes.data);
        }).finally(() => setLoading(false));
    }, [kivalasztottId]);

    if (user?.role !== 'tanar' && user?.role !== 'vezeto') {
        return <Typography sx={{ mt: 4 }} color="error">Ez az oldal csak tanároknak elérhető.</Typography>;
    }

    const diakok = kurzus?.diakok || [];
    const feladatok = kurzus?.feladatok || [];

    // Diák → feladat → beadás mapping
    const beadasTerkep = {};
    feladatok.forEach(f => {
        (f.beadasok || []).forEach(b => {
            if (!beadasTerkep[b.diak.id]) beadasTerkep[b.diak.id] = {};
            beadasTerkep[b.diak.id][f.id] = b;
        });
    });

    // Hiányzás összesítő diákonként
    const hianyzasSzam = {};
    hianyzasok.forEach(h => {
        if (!hianyzasSzam[h.diak.id]) hianyzasSzam[h.diak.id] = { osszes: 0, igazolatlan: 0 };
        hianyzasSzam[h.diak.id].osszes++;
        if (!h.igazolt) hianyzasSzam[h.diak.id].igazolatlan++;
    });

    const cellKattint = (diak, feladat) => {
        const beadas = beadasTerkep[diak.id]?.[feladat.id];
        setJegyDiakId(diak.id);
        setJegyFeladatId(feladat.id);
        setJegyErtek(beadas?.erdemjegy || '');
        setJegyVissza(beadas?.tanari_visszajelzes || '');
        setJegyFeladatCim(feladat.cim);
        setJegyDiakNev(`${diak.first_name} ${diak.last_name}`);
        setJegyModal(true);
    };

    const handleJegyMent = async () => {
        if (!jegyErtek) return;
        await axiosInstance.post('/tanar-jegy/', {
            diak_id: jegyDiakId,
            feladat_id: jegyFeladatId,
            erdemjegy: jegyErtek,
            visszajelzes: jegyVissza,
        });
        const kRes = await axiosInstance.get(`/kurzusok/${kivalasztottId}/`);
        setKurzus(kRes.data);
        setJegyModal(false);
    };

    const handleJegyTorol = async () => {
        if (!window.confirm('Törlöd ezt a jegyet?')) return;
        const beadas = beadasTerkep[jegyDiakId]?.[jegyFeladatId];
        if (beadas) {
            await axiosInstance.patch(`/beadasok/${beadas.id}/ertekel/`, { erdemjegy: null, tanari_visszajelzes: '' });
            const kRes = await axiosInstance.get(`/kurzusok/${kivalasztottId}/`);
            setKurzus(kRes.data);
        }
        setJegyModal(false);
    };

    const handleHianyzasRogzit = async (e) => {
        e.preventDefault();
        try {
            const resp = await axiosInstance.post('/hianyzasok/', {
                diak_id: hDiakId,
                kurzus: kivalasztottId,
                datum: hDatum,
                igazolt: hIgazolt,
                megjegyzes: hMegjegyzes,
            });
            setHianyzasok(prev => [resp.data, ...prev]);
            setHModalOpen(false);
            setHDiakId(''); setHIgazolt(false); setHMegjegyzes('');
        } catch (err) {
            alert(err.response?.data?.non_field_errors?.[0] || 'Hiba történt.');
        }
    };

    const handleIgazolasToggle = async (h) => {
        const resp = await axiosInstance.patch(`/hianyzasok/${h.id}/`, { igazolt: !h.igazolt });
        setHianyzasok(prev => prev.map(x => x.id === h.id ? resp.data : x));
    };

    const handleHianyzasTorles = async (hId) => {
        if (!window.confirm('Törlöd ezt a hiányzást?')) return;
        await axiosInstance.delete(`/hianyzasok/${hId}/`);
        setHianyzasok(prev => prev.filter(h => h.id !== hId));
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon /> Tanári Napló
            </Typography>

            <FormControl sx={{ mb: 3, minWidth: 280 }} size="small">
                <InputLabel>Kurzus</InputLabel>
                <Select value={kivalasztottId} label="Kurzus" onChange={e => setKivalasztottId(e.target.value)}>
                    {kurzusok.map(k => (
                        <MenuItem key={k.id} value={k.id}>{k.kurzus_neve}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}

            {!loading && kurzus && (
                <>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                        <Tab icon={<MenuBookIcon />} iconPosition="start" label="Jegyek" />
                        <Tab icon={<EventBusyIcon />} iconPosition="start" label={`Hiányzások (${hianyzasok.length})`} />
                    </Tabs>

                    {/* JEGYEK FÜL */}
                    {tab === 0 && (
                        diakok.length === 0 ? (
                            <Typography color="text.secondary">Nincs diák a kurzuson.</Typography>
                        ) : feladatok.length === 0 ? (
                            <Typography color="text.secondary">Nincs feladat a kurzuson.</Typography>
                        ) : (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    Kattints bármelyik cellára jegy beírásához vagy módosításához.
                                </Typography>
                                <Box sx={{ overflowX: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Diák</TableCell>
                                                {feladatok.map(f => (
                                                    <TableCell key={f.id} align="center" sx={{ minWidth: 100 }}>
                                                        <Tooltip title={f.cim} arrow>
                                                            <Typography variant="caption" fontWeight="bold" sx={{
                                                                display: 'block', maxWidth: 90,
                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                            }}>
                                                                {f.cim}
                                                            </Typography>
                                                        </Tooltip>
                                                        <Typography variant="caption" color="text.disabled" display="block">
                                                            {new Date(f.hatarido).toLocaleDateString('hu-HU')}
                                                        </Typography>
                                                    </TableCell>
                                                ))}
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Átlag</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hiányzás</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {diakok.map(diak => {
                                                const erdemjegyek = feladatok
                                                    .map(f => beadasTerkep[diak.id]?.[f.id]?.erdemjegy)
                                                    .filter(Boolean);
                                                const atlag = erdemjegyek.length > 0
                                                    ? (erdemjegyek.reduce((s, j) => s + j, 0) / erdemjegyek.length).toFixed(2)
                                                    : '—';
                                                const h = hianyzasSzam[diak.id];

                                                return (
                                                    <TableRow key={diak.id} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {diak.first_name} {diak.last_name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">{diak.username}</Typography>
                                                        </TableCell>
                                                        {feladatok.map(f => {
                                                            const beadas = beadasTerkep[diak.id]?.[f.id];
                                                            const jegy = beadas?.erdemjegy;
                                                            return (
                                                                <TableCell key={f.id} align="center">
                                                                    <Tooltip title={jegy ? `${jegy} — kattints a módosításhoz` : 'Kattints a jegy beírásához'} arrow>
                                                                        <Box
                                                                            onClick={() => cellKattint(diak, f)}
                                                                            sx={{
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                width: 36, height: 36,
                                                                                borderRadius: '50%',
                                                                                bgcolor: jegy ? getGradeColor(jegy) : 'action.hover',
                                                                                color: jegy ? '#fff' : 'text.disabled',
                                                                                fontWeight: 'bold',
                                                                                fontSize: '0.95rem',
                                                                                cursor: 'pointer',
                                                                                border: jegy ? 'none' : '1px dashed #ccc',
                                                                                transition: 'all 0.15s',
                                                                                '&:hover': { transform: 'scale(1.15)', opacity: 0.85 },
                                                                            }}
                                                                        >
                                                                            {jegy || '+'}
                                                                        </Box>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            );
                                                        })}
                                                        <TableCell align="center">
                                                            <Typography fontWeight="bold"
                                                                sx={{ color: atlag !== '—' ? getGradeColor(parseFloat(atlag)) : 'text.disabled' }}>
                                                                {atlag}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {h ? (
                                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                                    <Chip size="small" label={`${h.osszes} db`} variant="outlined" />
                                                                    {h.igazolatlan > 0 && <Chip size="small" label={`${h.igazolatlan} ig.atlan`} color="error" />}
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="caption" color="text.disabled">0</Typography>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </>
                        )
                    )}

                    {/* HIÁNYZÁSOK FÜL */}
                    {tab === 1 && (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button variant="contained" color="warning" startIcon={<AddIcon />}
                                    onClick={() => setHModalOpen(true)}>
                                    Hiányzás rögzítése
                                </Button>
                            </Box>
                            {hianyzasok.length === 0 ? (
                                <Typography color="text.secondary">Nincs rögzített hiányzás ennél a kurzusnál.</Typography>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Diák</TableCell>
                                            <TableCell>Dátum</TableCell>
                                            <TableCell>Állapot</TableCell>
                                            <TableCell>Megjegyzés</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {hianyzasok.map(h => (
                                            <TableRow key={h.id}>
                                                <TableCell>{h.diak.first_name} {h.diak.last_name}</TableCell>
                                                <TableCell>{h.datum}</TableCell>
                                                <TableCell>
                                                    <Chip size="small"
                                                        label={h.igazolt ? 'Igazolt' : 'Igazolatlan'}
                                                        color={h.igazolt ? 'success' : 'error'}
                                                        onClick={() => handleIgazolasToggle(h)}
                                                        sx={{ cursor: 'pointer' }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: 'text.secondary' }}>{h.megjegyzes || '—'}</TableCell>
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
                        </>
                    )}
                </>
            )}

            {/* Jegy modal */}
            <Modal open={jegyModal} onClose={() => setJegyModal(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" gutterBottom>Jegy beírása</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <b>{jegyDiakNev}</b> — {jegyFeladatCim}
                    </Typography>
                    <TextField
                        fullWidth label="Érdemjegy (1–10)"
                        type="number" inputProps={{ min: 1, max: 10 }}
                        value={jegyErtek}
                        onChange={e => setJegyErtek(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Megjegyzés / visszajelzés (opcionális)"
                        multiline rows={3}
                        value={jegyVissza}
                        onChange={e => setJegyVissza(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                            variant="contained" startIcon={<SaveIcon />}
                            onClick={handleJegyMent}
                            disabled={!jegyErtek || jegyErtek < 1 || jegyErtek > 10}
                        >
                            Mentés
                        </Button>
                        {beadasTerkep[jegyDiakId]?.[jegyFeladatId]?.erdemjegy && (
                            <Button variant="outlined" color="error" onClick={handleJegyTorol}>
                                Jegy törlése
                            </Button>
                        )}
                    </Box>
                </Box>
            </Modal>

            {/* Hiányzás modal */}
            <Modal open={hModalOpen} onClose={() => setHModalOpen(false)}>
                <Box sx={modalStyle} component="form" onSubmit={handleHianyzasRogzit}>
                    <Typography variant="h6" gutterBottom>Hiányzás rögzítése</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }} required>
                        <InputLabel>Diák</InputLabel>
                        <Select value={hDiakId} label="Diák" onChange={e => setHDiakId(e.target.value)}>
                            {diakok.map(d => (
                                <MenuItem key={d.id} value={d.id}>{d.first_name} {d.last_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth required type="date" label="Dátum"
                        value={hDatum} onChange={e => setHDatum(e.target.value)}
                        InputLabelProps={{ shrink: true }} sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={hIgazolt} onChange={e => setHIgazolt(e.target.checked)} />}
                        label="Igazolt hiányzás"
                    />
                    <TextField
                        fullWidth label="Megjegyzés (opcionális)"
                        value={hMegjegyzes} onChange={e => setHMegjegyzes(e.target.value)}
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <Button type="submit" variant="contained" color="warning">Rögzítés</Button>
                </Box>
            </Modal>
        </Paper>
    );
}

export default TanarNaploPage;
