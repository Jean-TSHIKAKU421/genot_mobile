import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function LoginScreen() {
    const [matricule, setMatricule] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleLogin = async () => {
        if (!matricule || !password) {
            setMessage('Matricule et mot de passe sont obligatoires.');
            setMessageType('error');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const r = await fetch(`${API_URL}/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricule, password })
            });
            const data = await r.json();
            if (data.success) {
                await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
                setMessage('✅ Connexion réussie. Redirection...');
                setMessageType('success');
                setTimeout(() => router.replace('/home'), 1000);
            } else {
                setMessage(data.message || 'Identifiants incorrects.');
                setMessageType('error');
            }
        } catch (e) {
            setMessage('Impossible de contacter le serveur.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Background décoratif */}
            <View style={styles.bgParticle1} />
            <View style={styles.bgParticle2} />
            <View style={styles.bgParticle3} />

            <View style={styles.card}>
                {/* Logo */}
                <View style={styles.logoWrapper}>
                    <Text style={styles.logoText}>📚</Text>
                </View>
                <Text style={styles.title}>Content de vous revoir</Text>
                <Text style={styles.subtitle}>Connectez-vous pour accéder à vos cours et notes</Text>

                {/* Formulaire */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Matricule <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputIcon}>🪪</Text>
                        <TextInput style={styles.input} placeholder="Votre matricule" placeholderTextColor="rgba(255,255,255,0.3)" value={matricule} onChangeText={setMatricule} autoCapitalize="none" />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Mot de passe <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput style={styles.input} placeholder="Votre mot de passe" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Options */}
                <View style={styles.options}>
                    <TouchableOpacity>
                        <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>
                </View>

                {/* Message */}
                {message ? (
                    <View style={[styles.messageBox, messageType === 'error' ? styles.messageError : styles.messageSuccess]}>
                        <Text style={[styles.messageText, messageType === 'error' ? styles.messageTextError : styles.messageTextSuccess]}>{message}</Text>
                    </View>
                ) : null}

                {/* Bouton */}
                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Se connecter →</Text>}
                </TouchableOpacity>

                {/* Footer */}
                <Text style={styles.footerText}>
                    Pas encore de compte ? <Text style={styles.footerLink} onPress={() => router.push('/register')}>Créer un compte</Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', padding: 20 },
    bgParticle1: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: '#6366f1', opacity: 0.08, top: -100, right: -100 },
    bgParticle2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#06b6d4', opacity: 0.08, bottom: -80, left: -80 },
    bgParticle3: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#8b5cf6', opacity: 0.08, top: '50%', left: '50%', marginLeft: -125, marginTop: -125 },
    card: {
        width: '100%', maxWidth: 420, backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 24, padding: 36, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
    },
    logoWrapper: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
    logoText: { fontSize: 36 },
    title: { fontSize: 26, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 30 },
    formGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '600', color: '#cbd5e1', marginBottom: 6 },
    required: { color: '#ef4444' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
    inputIcon: { fontSize: 16, paddingLeft: 14 },
    input: { flex: 1, padding: 14, fontSize: 15, color: '#fff' },
    eyeBtn: { paddingHorizontal: 14 },
    eyeIcon: { fontSize: 18 },
    options: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
    forgotLink: { color: '#818cf8', fontSize: 13, fontWeight: '500' },
    messageBox: { padding: 12, borderRadius: 10, marginBottom: 14 },
    messageError: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    messageSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
    messageText: { fontSize: 13, textAlign: 'center' },
    messageTextError: { color: '#fca5a5' },
    messageTextSuccess: { color: '#6ee7b7' },
    loginBtn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 20 },
    loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    footerText: { color: '#94a3b8', textAlign: 'center', fontSize: 13 },
    footerLink: { color: '#818cf8', fontWeight: '600' },
});