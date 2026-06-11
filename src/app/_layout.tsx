import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Layout() {
    return (
        <ThemeProvider>
            <Stack screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#020617' },
            }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="home" options={{ headerRight: () => <ThemeToggle /> }} />
                <Stack.Screen name="register" />
                <Stack.Screen name="settings" />
            </Stack>
        </ThemeProvider>
    );
}