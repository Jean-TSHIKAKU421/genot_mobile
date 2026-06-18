// _layout.tsx
import { useEffect, useState } from 'react';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const PUBLIC_ROUTES = ['index', 'register', 'reset-password'];

export default function Layout() {
    const [theme, setTheme] = useState('dark');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => { AsyncStorage.getItem('theme').then(t => { if (t) setTheme(t); setIsReady(true); }); }, []);

    const segments = useSegments();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        if (!navigationState?.key || !isReady) return;
        const checkAuth = async () => {
            const user = await AsyncStorage.getItem('currentUser');
            const currentRoute = segments[0] || 'index';
            if (!user && !PUBLIC_ROUTES.includes(currentRoute)) router.replace('/');
            else if (user && PUBLIC_ROUTES.includes(currentRoute) && currentRoute === 'index') router.replace('/home');
        };
        checkAuth();
    }, [segments, navigationState?.key, isReady]);

    const isDark = theme === 'dark';

    return (
        <ThemeProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? '#020617' : '#f0f2f5'} />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDark ? '#020617' : '#f0f2f5' }, animation: 'slide_from_right', animationDuration: 250 }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="register" />
                <Stack.Screen name="reset-password" />
                <Stack.Screen name="home" options={{ headerRight: () => <ThemeToggle />, gestureEnabled: false }} />
                <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="course" />
                <Stack.Screen name="add-course" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
                <Stack.Screen name="edit-course" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
                <Stack.Screen name="trash" options={{ animation: 'fade' }} />
                <Stack.Screen name="admin" options={{ animation: 'slide_from_left', gestureEnabled: false }} />
            </Stack>
        </ThemeProvider>
    );
};