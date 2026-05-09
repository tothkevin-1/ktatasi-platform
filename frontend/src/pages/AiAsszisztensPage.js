import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
    Box, Paper, Typography, TextField, Button,
    CircularProgress, Divider, Avatar
} from '@mui/material';
import { Send as SendIcon, SmartToy as AiIcon, Person as PersonIcon } from '@mui/icons-material';

function AiAsszisztensPage() {
    const [uzenet, setUzenet] = useState('');
    const [beszelgetes, setBeszelgetes] = useState([
        { szerep: 'ai', szoveg: 'Szia! Én vagyok az AI tanulmányi asszisztensed. Miben segíthetek ma?' }
    ]);
    const [loading, setLoading] = useState(false);
    const vegRef = useRef(null);

    useEffect(() => {
        vegRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [beszelgetes]);

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
            setBeszelgetes(prev => [...prev, { szerep: 'ai', szoveg: 'Sajnos hiba történt. Kérlek próbáld újra.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '75vh' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AiIcon color="primary" /> AI Tanulmányi Asszisztens
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Kérdezz bármit a tananyaggal kapcsolatban — az AI segít megérteni!
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Üzenetek */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, pr: 1 }}>
                {beszelgetes.map((uzenet, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: uzenet.szerep === 'diak' ? 'row-reverse' : 'row',
                            alignItems: 'flex-start',
                            gap: 1
                        }}
                    >
                        <Avatar sx={{
                            bgcolor: uzenet.szerep === 'ai' ? 'primary.main' : 'secondary.main',
                            width: 36, height: 36, flexShrink: 0
                        }}>
                            {uzenet.szerep === 'ai' ? <AiIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                        </Avatar>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1.5,
                                maxWidth: '75%',
                                bgcolor: uzenet.szerep === 'ai' ? 'action.hover' : 'primary.main',
                                color: uzenet.szerep === 'diak' ? 'primary.contrastText' : 'text.primary',
                                borderRadius: uzenet.szerep === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                            }}
                        >
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {uzenet.szoveg}
                            </Typography>
                        </Paper>
                    </Box>
                ))}
                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                            <AiIcon fontSize="small" />
                        </Avatar>
                        <CircularProgress size={20} />
                    </Box>
                )}
                <div ref={vegRef} />
            </Box>

            {/* Beviteli mező */}
            <Box component="form" onSubmit={handleKuldes} sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Írj egy kérdést..."
                    value={uzenet}
                    onChange={(e) => setUzenet(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleKuldes(e); }}
                    disabled={loading}
                    multiline
                    maxRows={3}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !uzenet.trim()}
                    sx={{ minWidth: 48, px: 2 }}
                >
                    <SendIcon />
                </Button>
            </Box>
        </Paper>
    );
}

export default AiAsszisztensPage;
