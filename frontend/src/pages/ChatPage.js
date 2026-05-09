import React, { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {
    Box, Paper, Typography, TextField, Button,
    Divider, Avatar, CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

function ChatPage() {
    const { user, authTokens } = useContext(AuthContext);
    const [uzenetek, setUzenetek] = useState([]);
    const [szoveg, setSzoveg] = useState('');
    const [kapcsolodva, setKapcsolodva] = useState(false);
    const wsRef = useRef(null);
    const vegRef = useRef(null);

    useEffect(() => {
        if (!authTokens?.access) return;

        const ws = new WebSocket(`ws://localhost:8000/ws/chat/?token=${authTokens.access}`);
        wsRef.current = ws;

        ws.onopen = () => setKapcsolodva(true);
        ws.onclose = () => setKapcsolodva(false);
        ws.onmessage = (e) => {
            const adat = JSON.parse(e.data);
            setUzenetek(prev => [...prev, adat]);
        };

        return () => ws.close();
    }, [authTokens]);

    useEffect(() => {
        vegRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [uzenetek]);

    const handleKuldes = (e) => {
        e.preventDefault();
        if (!szoveg.trim() || !kapcsolodva) return;
        wsRef.current.send(JSON.stringify({ szoveg: szoveg.trim() }));
        setSzoveg('');
    };

    const sajatE = (uzenet) => uzenet.felhasznalo_id === user?.id;

    return (
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '75vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h5">Közösségi Chat</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 10, height: 10, borderRadius: '50%',
                        bgcolor: kapcsolodva ? 'success.main' : 'error.main'
                    }} />
                    <Typography variant="body2" color="text.secondary">
                        {kapcsolodva ? 'Csatlakozva' : 'Kapcsolódás...'}
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Üzenetek */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, pr: 1 }}>
                {!kapcsolodva && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                )}
                {uzenetek.map((u, i) => {
                    const enVagyok = sajatE(u);
                    return (
                        <Box key={u.id || i} sx={{
                            display: 'flex',
                            flexDirection: enVagyok ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            gap: 1,
                        }}>
                            {!enVagyok && (
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                                    {u.felhasznalo?.[0]?.toUpperCase()}
                                </Avatar>
                            )}
                            <Box>
                                {!enVagyok && (
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                        {u.felhasznalo}
                                    </Typography>
                                )}
                                <Box sx={{
                                    px: 2, py: 1,
                                    bgcolor: enVagyok ? 'primary.main' : 'action.hover',
                                    color: enVagyok ? 'primary.contrastText' : 'text.primary',
                                    borderRadius: enVagyok ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                    maxWidth: 400,
                                }}>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                        {u.szoveg}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{
                                    display: 'block', mt: 0.3,
                                    textAlign: enVagyok ? 'right' : 'left',
                                    mx: 0.5
                                }}>
                                    {u.ido}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
                <div ref={vegRef} />
            </Box>

            <Divider sx={{ mt: 2 }} />

            {/* Bevitel */}
            <Box component="form" onSubmit={handleKuldes} sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Írj üzenetet..."
                    value={szoveg}
                    onChange={(e) => setSzoveg(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleKuldes(e); }}
                    disabled={!kapcsolodva}
                    multiline
                    maxRows={3}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!kapcsolodva || !szoveg.trim()}
                    sx={{ minWidth: 48 }}
                >
                    <SendIcon />
                </Button>
            </Box>
        </Paper>
    );
}

export default ChatPage;
