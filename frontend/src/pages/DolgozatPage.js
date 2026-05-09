import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import {
    Box, Paper, Typography, Button, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Slider,
    Divider, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField
} from '@mui/material';
import { Quiz as QuizIcon } from '@mui/icons-material';

const TANTARGYAK = [
    { ertek: 'internet_tortenete', nev: 'Az internet története' },
    { ertek: 'foldrajz', nev: 'Földrajz' },
    { ertek: 'biologia', nev: 'Biológia' },
];

function DolgozatPage() {
    const { user } = useContext(AuthContext);
    const [tantargy, setTantargy] = useState('');
    const [kerdesekSzama, setKerdesekSzama] = useState(5);
    const [kerdesek, setKerdesek] = useState(null);
    const [tantargyNev, setTantargyNev] = useState('');
    const [loading, setLoading] = useState(false);
    const [hiba, setHiba] = useState('');

    // Kiadás dialog
    const [dialogNyitva, setDialogNyitva] = useState(false);
    const [kurzusok, setKurzusok] = useState([]);
    const [kivalasztottKurzus, setKivalasztottKurzus] = useState('');
    const [cim, setCim] = useState('');
    const [hatarido, setHatarido] = useState('');
    const [kiadasLoading, setKiadasLoading] = useState(false);
    const [kiadasSiker, setKiadasSiker] = useState(false);

    useEffect(() => {
        axiosInstance.get('/kurzusok/').then(r => setKurzusok(r.data)).catch(() => {});
    }, []);

    if (user?.role !== 'tanar') {
        return <Alert severity="warning">Ez az oldal csak tanárok számára elérhető.</Alert>;
    }

    const generateDolgozat = async () => {
        if (!tantargy) return;
        setLoading(true);
        setHiba('');
        setKerdesek(null);
        setKiadasSiker(false);

        try {
            const response = await axiosInstance.post('/ai-dolgozat/', {
                tantargy,
                kerdesek_szama: kerdesekSzama,
            });
            setKerdesek(response.data.kerdesek);
            setTantargyNev(response.data.tantargy);
            setCim(`${response.data.tantargy} kvíz`);
        } catch (e) {
            setHiba(e.response?.data?.error || 'Hiba történt a generálás során.');
        } finally {
            setLoading(false);
        }
    };

    const handleKiadas = async () => {
        if (!kivalasztottKurzus || !cim || !hatarido) return;
        setKiadasLoading(true);
        try {
            await axiosInstance.post('/feladatok/', {
                kurzus_id: kivalasztottKurzus,
                cim,
                leiras: `AI által generált ${tantargyNev} kvíz (${kerdesek.length} kérdés)`,
                hatarido,
                tipus: 'kviz',
                kviz_kerdesek: kerdesek,
            });
            setKiadasSiker(true);
            setDialogNyitva(false);
            setKerdesek(null);
        } catch {
            setHiba('Hiba a feladat kiadásakor.');
        } finally {
            setKiadasLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QuizIcon color="primary" /> AI Kvíz generátor
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Generálj feleletválasztós kvízt a tananyagból, majd add ki feladatként a diákoknak.
            </Typography>
            <Divider sx={{ my: 2 }} />

            {kiadasSiker && <Alert severity="success" sx={{ mb: 2 }}>A kvíz sikeresen ki lett adva feladatként!</Alert>}
            {hiba && <Alert severity="error" sx={{ mb: 2 }}>{hiba}</Alert>}

            {!kerdesek && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400 }}>
                    <FormControl fullWidth>
                        <InputLabel>Tantárgy</InputLabel>
                        <Select value={tantargy} label="Tantárgy" onChange={(e) => setTantargy(e.target.value)}>
                            {TANTARGYAK.map(t => (
                                <MenuItem key={t.ertek} value={t.ertek}>{t.nev}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box>
                        <Typography gutterBottom>Kérdések száma: <strong>{kerdesekSzama}</strong></Typography>
                        <Slider value={kerdesekSzama} onChange={(_, v) => setKerdesekSzama(v)} min={3} max={10} step={1} marks />
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={generateDolgozat}
                        disabled={!tantargy || loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <QuizIcon />}
                    >
                        {loading ? 'Generálás...' : 'Kvíz generálása'}
                    </Button>

                    {loading && <Alert severity="info">Az AI kérdéseket készít — kb. 20-40 másodperc...</Alert>}
                </Box>
            )}

            {kerdesek && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="success">
                        {kerdesek.length} kérdés generálva — {tantargyNev}
                    </Alert>

                    {kerdesek.map((k, i) => (
                        <Paper key={i} variant="outlined" sx={{ p: 2 }}>
                            <Typography fontWeight="bold">{i + 1}. {k.kerdes}</Typography>
                            {['a', 'b', 'c', 'd'].map(b => (
                                <Typography key={b} variant="body2"
                                    sx={{ color: b === k.helyes ? 'success.main' : 'text.primary', ml: 2 }}>
                                    {b === k.helyes ? '✓ ' : '   '}{b.toUpperCase()}) {k.valaszok[b]}
                                </Typography>
                            ))}
                        </Paper>
                    ))}

                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button variant="contained" color="primary" onClick={() => setDialogNyitva(true)}>
                            Kiadás feladatként
                        </Button>
                        <Button variant="outlined" onClick={() => { setKerdesek(null); setKiadasSiker(false); }}>
                            Új generálás
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Kiadás dialog */}
            <Dialog open={dialogNyitva} onClose={() => setDialogNyitva(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Kvíz kiadása feladatként</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField label="Feladat címe" value={cim} onChange={e => setCim(e.target.value)} fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Kurzus</InputLabel>
                        <Select value={kivalasztottKurzus} label="Kurzus" onChange={e => setKivalasztottKurzus(e.target.value)}>
                            {kurzusok.map(k => (
                                <MenuItem key={k.id} value={k.id}>{k.kurzus_neve}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Határidő"
                        type="datetime-local"
                        value={hatarido}
                        onChange={e => setHatarido(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogNyitva(false)}>Mégse</Button>
                    <Button
                        variant="contained"
                        onClick={handleKiadas}
                        disabled={!kivalasztottKurzus || !cim || !hatarido || kiadasLoading}
                    >
                        {kiadasLoading ? <CircularProgress size={20} /> : 'Kiadás'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

export default DolgozatPage;
