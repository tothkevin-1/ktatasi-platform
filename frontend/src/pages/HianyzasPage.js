import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
    Box, Paper, Typography, Chip, CircularProgress, Divider,
    Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';

function HianyzasPage() {
    const [hianyzasok, setHianyzasok] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/hianyzasok/')
            .then(r => { setHianyzasok(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Kurzusonként csoportosítva
    const csoportositva = hianyzasok.reduce((acc, h) => {
        const nev = h.kurzus_neve;
        if (!acc[nev]) acc[nev] = [];
        acc[nev].push(h);
        return acc;
    }, {});

    const osszes = hianyzasok.length;
    const igazolatlan = hianyzasok.filter(h => !h.igazolt).length;

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventBusyIcon /> Hiányzásaim
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip label={`Összes: ${osszes}`} variant="outlined" />
                <Chip label={`Igazolatlan: ${igazolatlan}`} color={igazolatlan > 0 ? 'error' : 'default'} />
                <Chip label={`Igazolt: ${osszes - igazolatlan}`} color="success" variant="outlined" />
            </Box>

            {Object.keys(csoportositva).length === 0 ? (
                <Typography color="text.secondary">Nincs rögzített hiányzásod.</Typography>
            ) : (
                Object.entries(csoportositva).map(([kurzusNev, lista]) => (
                    <Box key={kurzusNev} sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>{kurzusNev}</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Dátum</TableCell>
                                    <TableCell>Állapot</TableCell>
                                    <TableCell>Megjegyzés</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lista.map(h => (
                                    <TableRow key={h.id}>
                                        <TableCell>{h.datum}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={h.igazolt ? 'Igazolt' : 'Igazolatlan'}
                                                color={h.igazolt ? 'success' : 'error'}
                                            />
                                        </TableCell>
                                        <TableCell>{h.megjegyzes || '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Divider sx={{ mt: 2 }} />
                    </Box>
                ))
            )}
        </Paper>
    );
}

export default HianyzasPage;
