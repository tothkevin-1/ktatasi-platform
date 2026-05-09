import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useTranslation } from 'react-i18next';
import { Typography, Box, Paper, Avatar } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const Sidebar = () => {
    const { t } = useTranslation(); // <-- Inicializálás
    const [dicsosegfal, setDicsosegfal] = useState({ ev_diakja: null, honap_diakja: null });

    useEffect(() => {
        axiosInstance.get('/ranglista/')
            .then(response => {
                const data = response.data;
                let ev_diakja = null;
                let honap_diakja = null;

                if (data && data.length > 0) {
                    ev_diakja = data[0];
                    if (data.length > 1) {
                        honap_diakja = data[1];
                    } else {
                        honap_diakja = data[0];
                    }
                }
                setDicsosegfal({ ev_diakja, honap_diakja });
            })
            .catch(error => console.error("Hiba a dicsőségfal betöltésekor", error));
    },[]);

    const { ev_diakja, honap_diakja } = dicsosegfal;

    return (
        <Box sx={{ position: { md: 'sticky' }, top: { md: '20px' } }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold' }}>
                <EmojiEventsIcon fontSize="large" /> {t('dicsosegfal_cim')}
            </Typography>
            
            {/* Az Év Diákja Kártya (Arany) */}
            <Paper elevation={4} sx={{ p: 1.5, mb: 2, textAlign: 'center', background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', color: '#000', borderRadius: 3 }}>
                <WorkspacePremiumIcon sx={{ fontSize: 30, color: '#fff' }} />
                <Typography variant="caption" fontWeight="bold" textTransform="uppercase" display="block">{t('ev_diakja')}</Typography>
                <Avatar sx={{ width: 40, height: 40, margin: '6px auto', bgcolor: '#fff', color: '#000', fontSize: '1rem', fontWeight: 'bold' }}>
                    {ev_diakja ? (ev_diakja.first_name ? ev_diakja.first_name[0].toUpperCase() : ev_diakja.username[0].toUpperCase()) : '?'}
                </Avatar>
                <Typography variant="body2" fontWeight="bold">
                    {ev_diakja ? `${ev_diakja.first_name} ${ev_diakja.last_name}` : t('nincs_helyezett')}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                    {ev_diakja ? ev_diakja.pontszam : 0} {t('pont')}
                </Typography>
            </Paper>

            {/* A Hónap Diákja Kártya (Ezüst) */}
            <Paper elevation={3} sx={{ p: 1.5, textAlign: 'center', background: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)', color: '#000', borderRadius: 3 }}>
                <EmojiEventsIcon sx={{ fontSize: 26, color: '#fff' }} />
                <Typography variant="caption" fontWeight="bold" textTransform="uppercase" display="block">{t('honap_diakja')}</Typography>
                <Avatar sx={{ width: 36, height: 36, margin: '6px auto', bgcolor: '#fff', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {honap_diakja ? (honap_diakja.first_name ? honap_diakja.first_name[0].toUpperCase() : honap_diakja.username[0].toUpperCase()) : '?'}
                </Avatar>
                <Typography variant="body2" fontWeight="bold">
                    {honap_diakja ? `${honap_diakja.first_name} ${honap_diakja.last_name}` : t('nincs_helyezett')}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                    {honap_diakja ? honap_diakja.pontszam : 0} {t('pont')}
                </Typography>
            </Paper>
        </Box>
    );
};

export default Sidebar;