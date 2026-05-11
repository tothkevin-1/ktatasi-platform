import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
    Typography, CircularProgress, Box, Paper, Divider, Tooltip, Avatar,
    Tab, Tabs, Chip, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventBusyIcon from '@mui/icons-material/EventBusy';

const getGradeColor = (jegy) => {
    if (jegy >= 9) return '#4caf50';
    if (jegy >= 7) return '#2196f3';
    if (jegy >= 5) return '#ff9800';
    if (jegy >= 3) return '#ff5722';
    return '#f44336';
};

function JegyekFul({ jegyekData }) {
    if (jegyekData.length === 0)
        return <Typography sx={{ mt: 3 }} color="text.secondary">Még nincsenek jegyeid.</Typography>;

    const osszatlag = (
        jegyekData.reduce((s, k) => s + parseFloat(k.atlag), 0) / jegyekData.length
    ).toFixed(2);

    return (
        <Box>
            {/* Összesítő kártya */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Paper elevation={4} sx={{ px: 3, py: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText', textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="overline" sx={{ opacity: 0.85 }}>Tanulmányi átlag</Typography>
                    <Typography variant="h4" fontWeight="bold">{osszatlag}</Typography>
                </Paper>
            </Box>

            {/* Tantárgyanként */}
            {jegyekData.map((kurzus, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        gap: 2, py: 1.5, px: 1,
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'action.hover' }
                    }}>
                        {/* Tantárgy neve */}
                        <Box sx={{ minWidth: 180 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{kurzus.tantargy_nev}</Typography>
                            <Typography variant="caption" color="text.secondary">{kurzus.kurzus_nev}</Typography>
                        </Box>

                        {/* Jegyek */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexGrow: 1 }}>
                            {kurzus.jegyek.map((jegy, i) => (
                                <Tooltip
                                    key={i}
                                    arrow
                                    title={
                                        <Box>
                                            <Typography variant="subtitle2">{jegy.feladat_cim}</Typography>
                                            <Typography variant="caption" display="block">{jegy.datum}</Typography>
                                            {jegy.tanari_visszajelzes && (
                                                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                    „{jegy.tanari_visszajelzes}"
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                >
                                    <Avatar sx={{
                                        bgcolor: getGradeColor(jegy.erdemjegy),
                                        width: 40, height: 40,
                                        fontWeight: 'bold', fontSize: '1.1rem',
                                        cursor: 'help', boxShadow: 1,
                                        transition: 'transform 0.15s',
                                        '&:hover': { transform: 'scale(1.15)' }
                                    }}>
                                        {jegy.erdemjegy}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </Box>

                        {/* Átlag */}
                        <Box sx={{ minWidth: 70, textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Átlag</Typography>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ color: getGradeColor(parseFloat(kurzus.atlag)) }}
                            >
                                {kurzus.atlag}
                            </Typography>
                        </Box>
                    </Box>
                    <Divider />
                </Box>
            ))}
        </Box>
    );
}

function HianyzasFul({ hianyzasok }) {
    const osszes = hianyzasok.length;
    const igazolatlan = hianyzasok.filter(h => !h.igazolt).length;

    // Kurzusonként csoportosítva
    const csoportositva = hianyzasok.reduce((acc, h) => {
        if (!acc[h.kurzus_neve]) acc[h.kurzus_neve] = [];
        acc[h.kurzus_neve].push(h);
        return acc;
    }, {});

    return (
        <Box>
            {/* Összesítő */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip label={`Összes hiányzás: ${osszes}`} variant="outlined" size="medium" />
                <Chip label={`Igazolatlan: ${igazolatlan}`} color={igazolatlan > 0 ? 'error' : 'default'} size="medium" />
                <Chip label={`Igazolt: ${osszes - igazolatlan}`} color="success" variant="outlined" size="medium" />
            </Box>

            {osszes === 0 ? (
                <Typography color="text.secondary">Nincs rögzített hiányzásod.</Typography>
            ) : (
                Object.entries(csoportositva).map(([kurzusNev, lista]) => (
                    <Box key={kurzusNev} sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{kurzusNev}</Typography>
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
                                        <TableCell sx={{ color: 'text.secondary' }}>{h.megjegyzes || '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Divider sx={{ mt: 2 }} />
                    </Box>
                ))
            )}
        </Box>
    );
}

function JegyekPage() {
    const [jegyekData, setJegyekData] = useState([]);
    const [hianyzasok, setHianyzasok] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        Promise.all([
            axiosInstance.get('/jegyek/'),
            axiosInstance.get('/hianyzasok/'),
        ]).then(([jRes, hRes]) => {
            setJegyekData(jRes.data);
            setHianyzasok(hRes.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Paper sx={{ p: { xs: 2, md: 4 }, minHeight: '80vh' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon fontSize="large" /> Digitális Napló
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Jegyeid és hiányzásaid áttekintése
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab icon={<MenuBookIcon />} iconPosition="start" label={`Jegyek (${jegyekData.length} tantárgy)`} />
                <Tab
                    icon={<EventBusyIcon />}
                    iconPosition="start"
                    label={`Hiányzások (${hianyzasok.length})`}
                    sx={{ color: hianyzasok.filter(h => !h.igazolt).length > 0 ? 'error.main' : 'inherit' }}
                />
            </Tabs>

            {tab === 0 && <JegyekFul jegyekData={jegyekData} />}
            {tab === 1 && <HianyzasFul hianyzasok={hianyzasok} />}
        </Paper>
    );
}

export default JegyekPage;
