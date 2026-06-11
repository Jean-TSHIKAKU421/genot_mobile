import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <TouchableOpacity onPress={toggleTheme} style={styles.btn}>
            <Text style={styles.icon}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    icon: { fontSize: 18 },
});