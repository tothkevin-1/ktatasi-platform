import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import dayjs from 'dayjs';
import 'dayjs/locale/hu';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Box, Typography, IconButton, Chip, Tooltip, Paper, Divider } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

dayjs.extend(isoWeek);
dayjs.locale('hu');

const NAPOK = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
const HONAPOK = ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sze', 'Okt', 'Nov', 'Dec'];

function MiniNaptar() {
    const navigate = useNavigate();
    const [aktualis, setAktualis] = useState(dayjs());
    const [feladatok, setFeladatok] = useState([]);

    useEffect(() => {
        axiosInstance.get('/kurzusok/').then(r => {
            const osszes = [];
            r.data.forEach(k => (k.feladatok || []).forEach(f =>
                osszes.push({ ...f, kurzus_neve: k.kurzus_neve })
            ));
            setFeladatok(osszes);
        }).catch(() => {});
    }, []);

    const honapElso = aktualis.startOf('month');
    const elsoNap = honapElso.startOf('isoWeek');
    const napok = [];
    let curr = elsoNap;
    while (napok.length < 42) {
        napok.push(curr);
        curr = curr.add(1, 'day');
    }

    const ma = dayjs();

    const feladatokNapon = (nap) =>
        feladatok.filter(f => dayjs(f.hatarido).format('YYYY-MM-DD') === nap.format('YYYY-MM-DD'));

    const kozelgoFeladatok = feladatok
        .filter(f => dayjs(f.hatarido).isAfter(ma))
        .sort((a, b) => dayjs(a.hatarido).diff(dayjs(b.hatarido)))
        .slice(0, 4);

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
            {/* Fejléc */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <IconButton size="small" onClick={() => setAktualis(p => p.subtract(1, 'month'))}>
                    <ChevronLeft fontSize="small" />
                </IconButton>
                <Typography variant="subtitle2" fontWeight="bold">
                    {aktualis.year()}. {HONAPOK[aktualis.month()]}
                </Typography>
                <IconButton size="small" onClick={() => setAktualis(p => p.add(1, 'month'))}>
                    <ChevronRight fontSize="small" />
                </IconButton>
            </Box>

            {/* Napfejlécek */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
                {NAPOK.map((n, i) => (
                    <Typography key={i} variant="caption" color="text.secondary"
                        sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.6rem' }}>
                        {n}
                    </Typography>
                ))}
            </Box>

            {/* Napok */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {napok.map((nap, i) => {
                    const maE = nap.isSame(ma, 'day');
                    const masHonapE = nap.month() !== aktualis.month();
                    const napFeladatok = feladatokNapon(nap);
                    const vanKviz = napFeladatok.some(f => f.tipus === 'kviz');
                    const vanFeladat = napFeladatok.some(f => f.tipus !== 'kviz');

                    return (
                        <Tooltip
                            key={i}
                            title={napFeladatok.map(f => f.cim).join(', ')}
                            disableHoverListener={napFeladatok.length === 0}
                            arrow
                        >
                            <Box
                                onClick={() => napFeladatok.length > 0 && navigate('/naptar')}
                                sx={{
                                    aspectRatio: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    cursor: napFeladatok.length > 0 ? 'pointer' : 'default',
                                    bgcolor: maE ? 'primary.main' : 'transparent',
                                    '&:hover': napFeladatok.length > 0 ? { bgcolor: maE ? 'primary.dark' : 'action.hover' } : {},
                                    position: 'relative',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.65rem',
                                        color: maE ? 'primary.contrastText' : masHonapE ? 'text.disabled' : 'text.primary',
                                        fontWeight: maE ? 'bold' : 'normal',
                                        lineHeight: 1,
                                    }}
                                >
                                    {nap.date()}
                                </Typography>
                                {(vanKviz || vanFeladat) && (
                                    <Box sx={{ display: 'flex', gap: '1px', mt: '1px' }}>
                                        {vanKviz && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'error.main' }} />}
                                        {vanFeladat && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.light' }} />}
                                    </Box>
                                )}
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>

            {/* Jelmagyarázat */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Kvíz</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.light' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Feladat</Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Közelgő feladatok */}
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
                KÖZELGŐ HATÁRIDŐK
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {kozelgoFeladatok.length === 0 ? (
                    <Typography variant="caption" color="text.disabled">Nincs közelgő határidő</Typography>
                ) : kozelgoFeladatok.map(f => {
                    const napokSzama = dayjs(f.hatarido).diff(ma, 'day');
                    return (
                        <Box key={f.id}
                            onClick={() => navigate(`/feladat/${f.id}`)}
                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                            <Box>
                                <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                    {f.cim}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    {dayjs(f.hatarido).format('MM.DD.')}
                                </Typography>
                            </Box>
                            <Chip
                                size="small"
                                label={napokSzama === 0 ? 'Ma!' : `${napokSzama}n`}
                                color={napokSzama <= 1 ? 'error' : napokSzama <= 3 ? 'warning' : 'default'}
                                sx={{ fontSize: '0.6rem', height: 18 }}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}

export default MiniNaptar;
