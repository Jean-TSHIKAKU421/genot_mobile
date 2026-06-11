import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
    const [matricule, setMatricule] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!matricule || !password) { Alert.alert('Erreur', 'Matricule et mot de passe requis.'); return; }
        setLoading(true);
        try {
            const data = await api.login(matricule, password);
            if (data.success) {
                await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
                navigation.replace('Home');
            } else {
                Alert.alert('Erreur', data.message);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.logo}>📚</Text>
                <Text style={styles.title}>GeNot</Text>
                <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

                <Text style={styles.label}>Matricule</Text>
                <TextInput style={styles.input} placeholder="Votre matricule" placeholderTextColor="#94a3b8" value={matricule} onChangeText={setMatricule} autoCapitalize="none" />

                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.passwordContainer}>
                    <TextInput style={styles.passwordInput} placeholder="Votre mot de passe" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Se connecter</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>Pas encore de compte ? <Text style={styles.linkBold}>S'inscrire</Text></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', padding: 20 },
    card: { backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
    logo: { fontSize: 50, textAlign: 'center', marginBottom: 8 },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 30 },
    label: { fontSize: 13, fontWeight: '600', color: '#cbd5e1', marginBottom: 6 },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, fontSize: 16, color: '#fff', marginBottom: 16 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 16 },
    passwordInput: { flex: 1, padding: 14, fontSize: 16, color: '#fff' },
    eyeBtn: { paddingHorizontal: 14 },
    eyeText: { fontSize: 20 },
    loginBtn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    link: { color: '#94a3b8', textAlign: 'center', fontSize: 14 },
    linkBold: { color: '#818cf8', fontWeight: '700' },
});