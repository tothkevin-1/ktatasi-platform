import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
    Box, Paper, Typography, TextField, Button,
    CircularProgress, Divider, Avatar, IconButton
} from '@mui/material';
import { Send as SendIcon, SmartToy as AiIcon, Close as CloseIcon } from '@mui/icons-material';

function AiChatWidget() {
    const [nyitva, setNyitva] = useState(false);
    const [uzenet, setUzenet] = useState('');
    const [beszelgetes, setBeszelgetes] = useState([
        { szerep: 'ai', szoveg: 'Szia! Miben segíthetek?' }
    ]);
    const [loading, setLoading] = useState(false);
    const vegRef = useRef(null);

    useEffect(() => {
        if (nyitva) vegRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [beszelgetes, nyitva]);

    const handleKuldes = async (e) => {
        e.preventDefault();
        if (!uzenet.trim() || loading) return;

        const diakUzenet = uzenet.trim();
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

    return (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {/* Chat ablak — felfele nyílik */}
            {nyitva && (
                <Paper
                    elevation={8}
                    sx={{
                        width: 320,
                        borderRadius: 3,
                        overflow: 'hidden',
                        mb: 1,
                    }}
                >
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
                        <IconButton size="small" onClick={() => setNyitva(false)} sx={{ color: 'inherit' }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
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
                                <CircularProgress size={14} />
                            </Box>
                        )}
                        <div ref={vegRef} />
                    </Box>

                    <Divider />

                    {/* Beviteli mező */}
                    <Box component="form" onSubmit={handleKuldes} sx={{ display: 'flex', gap: 1, p: 1 }}>
                        <TextField
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
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 6,
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
