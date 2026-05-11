import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
    Box, Paper, Typography, TextField, Button,
    CircularProgress, Divider, Avatar, IconButton, Chip,
    Select, MenuItem, FormControl
} from '@mui/material';
import { Send as SendIcon, SmartToy as AiIcon, Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const TANTARGYAK = [
    { ertek: '', nev: 'Általános kérdés' },
    { ertek: 'Az internet története', nev: 'Az internet története' },
    { ertek: 'Földrajz', nev: 'Földrajz' },
    { ertek: 'Biológia', nev: 'Biológia' },
];

const GYORS_KERDESEK = [
    'Magyarázd el lépésről lépésre!',
    'Adj egy valós életbeli példát!',
    'Mik a legfontosabb kulcsfogalmak?',
    'Mi szokott dolgozatban szerepelni ebből?',
    'Hogyan jegyezzem meg könnyen?',
    'Mi a különbség a két fogalom között?',
];

function AiChatWidget() {
    const [nyitva, setNyitva] = useState(false);
    const [uzenet, setUzenet] = useState('');
    const [tantargy, setTantargy] = useState('');
    const [beszelgetes, setBeszelgetes] = useState([
        { szerep: 'ai', szoveg: 'Szia! Miben segíthetek? 📚' }
    ]);
    const [loading, setLoading] = useState(false);
    const vegRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (nyitva) vegRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [beszelgetes, nyitva]);

    useEffect(() => {
        if (nyitva) setTimeout(() => inputRef.current?.focus(), 100);
    }, [nyitva]);

    const kuldes = async (szoveg) => {
        if (!szoveg.trim() || loading) return;
        const diakUzenet = szoveg.trim();
        setUzenet('');
        setBeszelgetes(prev => [...prev, { szerep: 'diak', szoveg: diakUzenet }]);
        setLoading(true);
        try {
            const response = await axiosInstance.post('/ai-chat/', { uzenet: diakUzenet });
            setBeszelgetes(prev => [...prev, { szerep: 'ai', szoveg: response.data.valasz }]);
        } catch {
            setBeszelgetes(prev => [...prev, { szerep: 'ai', szoveg: 'Hiba történt. Próbáld újra.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKuldes = (e) => { e.preventDefault(); kuldes(uzenet); };
    const handleGyorsKerdes = (kerdes) => {
        const szoveg = tantargy ? `${tantargy} tantárgy kapcsán: ${kerdes}` : kerdes;
        kuldes(szoveg);
    };
    const handleReset = () => {
        setBeszelgetes([{ szerep: 'ai', szoveg: 'Szia! Miben segíthetek? 📚' }]);
        setTantargy('');
    };

    // Csak az első üzenet van → mutassuk a gyors kérdéseket
    const mutatGyorsKerdeseket = beszelgetes.length === 1;

    return (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {nyitva && (
                <Paper elevation={8} sx={{ width: 320, borderRadius: 3, overflow: 'hidden', mb: 1 }}>

                    {/* Fejléc */}
                    <Box sx={{
                        bgcolor: 'primary.main', color: 'primary.contrastText',
                        px: 2, py: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AiIcon fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">AI Asszisztens</Typography>
                        </Box>
                        <Box>
                            <IconButton size="small" onClick={handleReset} sx={{ color: 'inherit' }} title="Új beszélgetés">
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setNyitva(false)} sx={{ color: 'inherit' }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Tantárgy választó */}
                    <Box sx={{ px: 1.5, py: 0.8, bgcolor: 'action.hover' }}>
                        <FormControl fullWidth size="small">
                            <Select
                                value={tantargy}
                                onChange={e => setTantargy(e.target.value)}
                                displayEmpty
                                sx={{ fontSize: '0.75rem', '& .MuiSelect-select': { py: 0.5 } }}
                            >
                                {TANTARGYAK.map(t => (
                                    <MenuItem key={t.ertek} value={t.ertek} sx={{ fontSize: '0.8rem' }}>
                                        {t.nev}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider />

                    {/* Üzenetek */}
                    <Box sx={{ height: 260, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {beszelgetes.map((msg, i) => (
                            <Box key={i} sx={{
                                display: 'flex',
                                flexDirection: msg.szerep === 'diak' ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 0.5,
                            }}>
                                {msg.szerep === 'ai' && (
                                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', flexShrink: 0 }}>
                                        <AiIcon sx={{ fontSize: 14 }} />
                                    </Avatar>
                                )}
                                <Box sx={{
                                    maxWidth: '85%',
                                    px: 1.2, py: 0.8,
                                    borderRadius: msg.szerep === 'ai' ? '4px 10px 10px 10px' : '10px 4px 10px 10px',
                                    bgcolor: msg.szerep === 'ai' ? 'action.hover' : 'primary.main',
                                    color: msg.szerep === 'diak' ? 'primary.contrastText' : 'text.primary',
                                }}>
                                    <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.72rem' }}>
                                        {msg.szoveg}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}

                        {loading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                    <AiIcon sx={{ fontSize: 14 }} />
                                </Avatar>
                                <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center', px: 1, py: 0.5, bgcolor: 'action.hover', borderRadius: '4px 10px 10px 10px' }}>
                                    {[0, 1, 2].map(i => (
                                        <Box key={i} sx={{
                                            width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main',
                                            animation: 'bounce 1.2s infinite',
                                            animationDelay: `${i * 0.2}s`,
                                            '@keyframes bounce': {
                                                '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
                                                '40%': { transform: 'scale(1)', opacity: 1 },
                                            }
                                        }} />
                                    ))}
                                </Box>
                            </Box>
                        )}
                        <div ref={vegRef} />
                    </Box>

                    {/* Gyors kérdések — csak az elején */}
                    {mutatGyorsKerdeseket && !loading && (
                        <>
                            <Divider />
                            <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {GYORS_KERDESEK.map(k => (
                                    <Chip
                                        key={k}
                                        label={k}
                                        size="small"
                                        variant="outlined"
                                        clickable
                                        onClick={() => handleGyorsKerdes(k)}
                                        sx={{ fontSize: '0.65rem' }}
                                    />
                                ))}
                            </Box>
                        </>
                    )}

                    <Divider />

                    {/* Beviteli mező */}
                    <Box component="form" onSubmit={handleKuldes} sx={{ display: 'flex', gap: 1, p: 1 }}>
                        <TextField
                            inputRef={inputRef}
                            fullWidth
                            size="small"
                            placeholder="Írj üzenetet..."
                            value={uzenet}
                            onChange={(e) => setUzenet(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleKuldes(e); }}
                            disabled={loading}
                            multiline
                            maxRows={2}
                            sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !uzenet.trim()}
                            sx={{ minWidth: 36, px: 1 }}
                        >
                            <SendIcon sx={{ fontSize: 16 }} />
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Kék kerek gomb */}
            <Box
                onClick={() => setNyitva(prev => !prev)}
                sx={{
                    width: 52, height: 52, borderRadius: '50%',
                    bgcolor: 'primary.main', color: 'primary.contrastText',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: 6,
                    '&:hover': { bgcolor: 'primary.dark' },
                    transition: 'background 0.2s',
                }}
            >
                <AiIcon />
            </Box>
        </Box>
    );
}

export default AiChatWidget;
