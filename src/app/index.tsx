import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
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
        if (!matricule || !password) { setMessage('Matricule et mot de passe requis.'); setMessageType('error'); return; }
        if (matricule === '24AD421SI' && password === 'tikiplugg') {
            await AsyncStorage.setItem('currentUser', JSON.stringify({ matricule: '24AD421SI', nom: 'Admin', admin: true }));
            router.replace('/admin'); return;
        }
        setLoading(true); setMessage('');
        try {
            const r = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matricule, password }) });
            const data = await r.json();
            if (data.success) { await AsyncStorage.setItem('currentUser', JSON.stringify(data.user)); setMessage('✅ Connexion réussie.'); setMessageType('success'); setTimeout(() => router.replace('/home'), 800); }
            else { setMessage(data.message || 'Identifiants incorrects.'); setMessageType('error'); }
        } catch (e) { setMessage('Impossible de contacter le serveur.'); setMessageType('error'); }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.bgCircle1} /><View style={styles.bgCircle2} /><View style={styles.bgCircle3} />
            <View style={styles.card}>
                <View style={styles.logoWrapper}><FontAwesome5 name="book" size={32} color="#fff" /></View>
                <Text style={styles.title}>Content de vous revoir</Text>
                <Text style={styles.subtitle}>Connectez-vous pour accéder à vos cours et notes</Text>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Matricule <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                        <FontAwesome5 name="id-card" size={16} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Votre matricule" placeholderTextColor="rgba(255,255,255,0.3)" value={matricule} onChangeText={setMatricule} autoCapitalize="none" />
                    </View>
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Mot de passe <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                        <FontAwesome5 name="lock" size={16} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Votre mot de passe" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}><FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={16} color="#94a3b8" /></TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/reset-password')}><Text style={styles.forgotText}>Mot de passe oublié ?</Text></TouchableOpacity>
                {message ? <View style={[styles.messageBox, messageType === 'error' ? styles.messageError : styles.messageSuccess]}><Text style={[styles.messageText, messageType === 'error' ? styles.messageTextError : styles.messageTextSuccess]}>{message}</Text></View> : null}
                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                    {loading ? <ActivityIndicator color="#fff" /> : <View style={styles.loginBtnContent}><Text style={styles.loginBtnText}>Se connecter</Text><FontAwesome5 name="arrow-right" size={14} color="#fff" /></View>}
                </TouchableOpacity>
                <View style={styles.footer}><Text style={styles.footerText}>Pas encore de compte ? </Text><TouchableOpacity onPress={() => router.push('/register')}><Text style={styles.footerLink}>Créer un compte</Text></TouchableOpacity></View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', padding: 24 },
    bgCircle1: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: '#6366f1', opacity: 0.06, top: -80, right: -80 },
    bgCircle2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#06b6d4', opacity: 0.06, bottom: -60, left: -60 },
    bgCircle3: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#8b5cf6', opacity: 0.06, top: '45%', left: '50%', marginLeft: -100, marginTop: -100 },
    card: { width: '100%', maxWidth: 440, backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 24, padding: 36, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
    logoWrapper: { width: 72, height: 72, borderRadius: 18, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 22, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    title: { fontSize: 26, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 },
    required: { color: '#ef4444' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden' },
    inputIcon: { paddingLeft: 16, width: 44 },
    input: { flex: 1, paddingVertical: 15, paddingRight: 14, fontSize: 15, color: '#fff' },
    eyeBtn: { paddingHorizontal: 14, paddingVertical: 15 },
    forgotBtn: { alignSelf: 'flex-end', marginBottom: 22, marginTop: -4 },
    forgotText: { color: '#818cf8', fontSize: 13, fontWeight: '500' },
    messageBox: { padding: 14, borderRadius: 12, marginBottom: 18 },
    messageError: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    messageSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
    messageText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
    messageTextError: { color: '#fca5a5' },
    messageTextSuccess: { color: '#6ee7b7' },
    loginBtn: { backgroundColor: '#6366f1', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 24, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    loginBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { color: '#94a3b8', fontSize: 14 },
    footerLink: { color: '#818cf8', fontSize: 14, fontWeight: '600' },
});