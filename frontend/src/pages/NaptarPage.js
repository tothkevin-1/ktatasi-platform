import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AuthContext from '../context/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/hu';
import {
    Box, Paper, Typography, IconButton, Grid, Chip,
    Tooltip, CircularProgress, Badge
} from '@mui/material';
import { ChevronLeft, ChevronRight, Today as TodayIcon } from '@mui/icons-material';

dayjs.locale('hu');

const NAPOK = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
const HONAPOK = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];

function NaptarPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [aktualis, setAktualis] = useState(dayjs());
    const [feladatok, setFeladatok] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                // Kurzusokon keresztül gyűjtjük a feladatokat
                const kurzusResp = await axiosInstance.get('/kurzusok/');
                const osszes = [];
                kurzusResp.data.forEach(k => {
                    (k.feladatok || []).forEach(f => {
                        osszes.push({ ...f, kurzus_neve: k.kurzus_neve });
                    });
                });
                setFeladatok(osszes);
            } catch {
                setFeladatok([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Naptár napjainak kiszámítása
    const honapElso = aktualis.startOf('month');
    const honapUtolso = aktualis.endOf('month');
    // Hétfőtől számítjuk (isoWeekday: 1=hétfő)
    const elsoNap = honapElso.startOf('isoWeek');
    const utolsoNap = honapUtolso.endOf('isoWeek');

    const napok = [];
    let curr = elsoNap;
    while (curr.isBefore(utolsoNap) || curr.isSame(utolsoNap, 'day')) {
        napok.push(curr);
        curr = curr.add(1, 'day');
    }

    const feladatokNapon = (nap) => feladatok.filter(f =>
        dayjs(f.hatarido).format('YYYY-MM-DD') === nap.format('YYYY-MM-DD')
    );

    const ma = dayjs();

    return (
        <Paper sx={{ p: 3 }}>
            {/* Fejléc */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => setAktualis(prev => prev.subtract(1, 'month'))}>
                        <ChevronLeft />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold" sx={{ minWidth: 200, textAlign: 'center' }}>
                        {aktualis.year()}. {HONAPOK[aktualis.month()]}
                    </Typography>
                    <IconButton onClick={() => setAktualis(prev => prev.add(1, 'month'))}>
                        <ChevronRight />
                    </IconButton>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip size="small" label="Feladat" color="primary" variant="outlined" />
                        <Chip size="small" label="Kvíz / Dolgozat" color="error" variant="outlined" />
                    </Box>
                    <IconButton onClick={() => setAktualis(dayjs())} title="Ma">
                        <TodayIcon />
                    </IconButton>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Napok fejléce */}
                    <Grid container columns={7} sx={{ mb: 1 }}>
                        {NAPOK.map(nap => (
                            <Grid item xs={1} key={nap}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary"
                                    sx={{ display: 'block', textAlign: 'center', pb: 1 }}>
                                    {nap}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Naptár cellák */}
                    <Grid container columns={7} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        {napok.map((nap, i) => {
                            const maE = nap.isSame(ma, 'day');
                            const aktualisHonapE = nap.month() === aktualis.month();
                            const napFeladatok = feladatokNapon(nap);

                            return (
                                <Grid item xs={1} key={i} sx={{
                                    minHeight: 100,
                                    borderRight: (i + 1) % 7 !== 0 ? '1px solid' : 'none',
                                    borderBottom: i < napok.length - 7 ? '1px solid' : 'none',
                                    borderColor: 'divider',
                                    bgcolor: maE ? 'primary.light' : aktualisHonapE ? 'background.paper' : 'action.hover',
                                    p: 0.5,
                                }}>
                                    <Typography variant="body2" fontWeight={maE ? 'bold' : 'normal'}
                                        color={maE ? 'primary.contrastText' : aktualisHonapE ? 'text.primary' : 'text.disabled'}
                                        sx={{ textAlign: 'right', mb: 0.5 }}>
                                        {nap.date()}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                        {napFeladatok.map(f => (
                                            <Tooltip key={f.id} title={`${f.kurzus_neve} — ${dayjs(f.hatarido).format('HH:mm')}`} arrow>
                                                <Chip
                                                    label={f.cim}
                                                    size="small"
                                                    color={f.tipus === 'kviz' ? 'error' : 'primary'}
                                                    onClick={() => navigate(`/feladat/${f.id}`)}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        height: 20,
                                                        cursor: 'pointer',
                                                        maxWidth: '100%',
                                                        '& .MuiChip-label': { px: 0.8, overflow: 'hidden', textOverflow: 'ellipsis' }
                                                    }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Közelgő feladatok lista */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>Közelgő határidők</Typography>
                        {feladatok
                            .filter(f => dayjs(f.hatarido).isAfter(ma))
                            .sort((a, b) => dayjs(a.hatarido).diff(dayjs(b.hatarido)))
                            .slice(0, 5)
                            .map(f => {
                                const napokSzama = dayjs(f.hatarido).diff(ma, 'day');
                                return (
                                    <Box key={f.id}
                                        onClick={() => navigate(`/feladat/${f.id}`)}
                                        sx={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            p: 1.5, mb: 1, borderRadius: 2, cursor: 'pointer',
                                            border: '1px solid', borderColor: 'divider',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{f.cim}</Typography>
                                            <Typography variant="caption" color="text.secondary">{f.kurzus_neve}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Chip
                                                size="small"
                                                label={napokSzama === 0 ? 'Ma!' : `${napokSzama} nap`}
                                                color={napokSzama <= 1 ? 'error' : napokSzama <= 3 ? 'warning' : 'default'}
                                            />
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                {dayjs(f.hatarido).format('MM.DD. HH:mm')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        {feladatok.filter(f => dayjs(f.hatarido).isAfter(ma)).length === 0 && (
                            <Typography color="text.secondary">Nincs közelgő határidő.</Typography>
                        )}
                    </Box>
                </>
            )}
        </Paper>
    );
}

export default NaptarPage;
