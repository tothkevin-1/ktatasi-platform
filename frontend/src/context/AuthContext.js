import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../utils/axiosInstance';
import NotificationContext from './NotificationContext';

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
    const { notify } = useContext(NotificationContext);

    // Hitelesítéshez és user adatokhoz kapcsolódó state-ek
    let [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    let [user, setUser] = useState(() => localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    let[loading, setLoading] = useState(true);

    // --- SÖTÉT MÓD TÁROLÁSA A LOCALSTORAGE-BAN ---
    const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
    
    const navigate = useNavigate();

    // Témaváltó logika
    const colorMode = useMemo(
        () => ({
          toggleColorMode: () => {
            setMode((prevMode) => {
              const newMode = prevMode === 'light' ? 'dark' : 'light';
              // Elmentjük a böngészőbe a választott témát, hogy frissítés után is megmaradjon
              localStorage.setItem('themeMode', newMode);
              return newMode;
            });
          },
        }),[] // Üres dependency array, hogy csak egyszer jöjjön létre
    );

    let loginUser = async (username, password) => {
        try {
            const tokenResponse = await axios.post('http://localhost:8000/api/token/', { username, password });
            if (tokenResponse.status === 200) {
                setAuthTokens(tokenResponse.data);
                localStorage.setItem('authTokens', JSON.stringify(tokenResponse.data));

                const decodedToken = jwtDecode(tokenResponse.data.access);
                const userResponse = await axiosInstance.get(`/users/${decodedToken.user_id}/`);
                
                setUser(userResponse.data);
                localStorage.setItem('user', JSON.stringify(userResponse.data));

                navigate('/');
            }
        } catch (error) {
            console.error("Hiba a bejelentkezés során!", error);
            notify("Hiba a bejelentkezés során! Hibás jelszó vagy felhasználónév.", "error");
        }
    };

    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    const contextData = {
        user,
        authTokens,
        loading,
        mode,
        colorMode,
        loginUser,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};