import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
    Box, Paper, Typography, TextField, Button,
    CircularProgress, IconButton, Fab, Collapse, Divider, Avatar
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon, SmartToy as AiIcon } from '@mui/icons-material';

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
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
            {/* Chat ablak */}
            <Collapse in={nyitva} timeout="auto">
                <Paper
                    elevation={8}
                    sx={{
                        width: 320,
                        height: 440,
                        mb: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}
                >
                    {/* Fejléc */}
                    <Box sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 2, py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AiIcon />
                            <Typography variant="subtitle1" fontWeight="bold">AI Asszisztens</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setNyitva(false)} sx={{ color: 'inherit' }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Divider />

                    {/* Üzenetek */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {beszelgetes.map((msg, i) => (
                            <Box key={i} sx={{
                                display: 'flex',
                                flexDirection: msg.szerep === 'diak' ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 0.5,
                            }}>
                                {msg.szerep === 'ai' && (
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', flexShrink: 0 }}>
                                        <AiIcon sx={{ fontSize: 16 }} />
                                    </Avatar>
                                )}
                                <Box sx={{
                                    maxWidth: '80%',
                                    px: 1.5, py: 1,
                                    borderRadius: msg.szerep === 'ai' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                                    bgcolor: msg.szerep === 'ai' ? 'action.hover' : 'primary.main',
                                    color: msg.szerep === 'diak' ? 'primary.contrastText' : 'text.primary',
                                }}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {msg.szoveg}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        {loading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                                    <AiIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                                <CircularProgress size={16} />
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
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !uzenet.trim()}
                            sx={{ minWidth: 40, px: 1.5 }}
                        >
                            <SendIcon fontSize="small" />
                        </Button>
                    </Box>
                </Paper>
            </Collapse>

            {/* Lebegő gomb */}
            <Fab
                color="primary"
                onClick={() => setNyitva(prev => !prev)}
                sx={{ boxShadow: 6 }}
            >
                <AiIcon />
            </Fab>
        </Box>
    );
}

export default AiChatWidget;
