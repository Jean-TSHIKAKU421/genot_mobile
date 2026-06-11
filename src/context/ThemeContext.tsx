import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => { loadTheme(); }, []);

    const loadTheme = async () => {
        const t = await AsyncStorage.getItem('theme');
        if (t) setTheme(t);
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
        const u = await AsyncStorage.getItem('currentUser');
        if (u) {
            const user = JSON.parse(u);
            try {
                await fetch(`https://jtt.alwaysdata.net/api/save-theme`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ matricule: user.matricule, theme: newTheme })
                });
            } catch (e) {}
        }
    };

    const colors = theme === 'dark' ? {
        bg: '#020617', card: '#0f172a', text: '#f1f5f9', textSecondary: '#94a3b8',
        primary: '#818cf8', border: 'rgba(99,102,241,0.2)', inputBg: 'rgba(255,255,255,0.05)',
    } : {
        bg: '#f0f2f5', card: '#ffffff', text: '#1a1a2e', textSecondary: '#64748b',
        primary: '#6366f1', border: '#e2e8f0', inputBg: '#f8fafc',
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() { return useContext(ThemeContext); }