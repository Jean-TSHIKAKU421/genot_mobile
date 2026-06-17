import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function ResetPasswordScreen() {
    const [step, setStep] = useState(1);
    const [matricule, setMatricule] = useState('');
    const [question1, setQuestion1] = useState('');
    const [question2, setQuestion2] = useState('');
    const [reponse1, setReponse1] = useState('');
    const [reponse2, setReponse2] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const loadQuestions = async () => {
        if (!matricule.trim()) { setMessage('Veuillez entrer votre matricule.'); setMessageType('error'); return; }
        setLoading(true); setMessage('');
        try {
            const r = await fetch(`${API_URL}/security-questions/${matricule}`);
            const d = await r.json();
            if (d.success) { setQuestion1(d.question1); setQuestion2(d.question2); setStep(2); }
            else { setMessage(d.message); setMessageType('error'); }
        } catch (e) { setMessage('Erreur de connexion.'); setMessageType('error'); }
        setLoading(false);
    };

    const verifyAnswers = async () => {
        if (!reponse1.trim() || !reponse2.trim()) { setMessage('Veuillez répondre aux deux questions.'); setMessageType('error'); return; }
        setLoading(true); setMessage('');
        try {
            const r = await fetch(`${API_URL}/verify-security-answers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matricule, reponse1, reponse2 }) });
            const d = await r.json();
            if (d.success) { setStep(3); } else { setMessage(d.message); setMessageType('error'); }
        } catch (e) { setMessage('Erreur de connexion.'); setMessageType('error'); }
        setLoading(false);
    };

    const resetPassword = async () => {
        if (!newPassword || newPassword.length < 8) { setMessage('Minimum 8 caractères.'); setMessageType('error'); return; }
        if (newPassword !== confirmPassword) { setMessage('Les mots de passe ne correspondent pas.'); setMessageType('error'); return; }
        setLoading(true); setMessage('');
        try {
            const r = await fetch(`${API_URL}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matricule, newPassword }) });
            const d = await r.json();
            if (d.success) { setStep(4); } else { setMessage(d.message); setMessageType('error'); }
        } catch (e) { setMessage('Erreur de connexion.'); setMessageType('error'); }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <View style={styles.logoWrapper}>
                        <FontAwesome5 name="lock" size={36} color="#fff" />
                    </View>
                    <Text style={styles.title}>Réinitialiser le mot de passe</Text>

                    {step === 1 && (
                        <>
                            <Text style={styles.subtitle}>Entrez votre matricule pour continuer</Text>
                            <Text style={styles.label}>Matricule <Text style={{ color: '#ef4444' }}>*</Text></Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome5 name="id-card" size={16} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Votre matricule" placeholderTextColor="rgba(255,255,255,0.3)" value={matricule} onChangeText={setMatricule} autoCapitalize="none" />
                            </View>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <Text style={styles.subtitle}>Répondez à vos questions de sécurité</Text>
                            <Text style={styles.label}>{question1}</Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome5 name="key" size={16} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Votre réponse" placeholderTextColor="rgba(255,255,255,0.3)" value={reponse1} onChangeText={setReponse1} />
                            </View>
                            <Text style={styles.label}>{question2}</Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome5 name="key" size={16} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Votre réponse" placeholderTextColor="rgba(255,255,255,0.3)" value={reponse2} onChangeText={setReponse2} />
                            </View>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <Text style={styles.subtitle}>Choisissez un nouveau mot de passe</Text>
                            <Text style={styles.label}>Nouveau mot de passe <Text style={{ color: '#ef4444' }}>*</Text></Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome5 name="lock" size={16} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Minimum 8 caractères" placeholderTextColor="rgba(255,255,255,0.3)" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                            </View>
                            <Text style={styles.label}>Confirmer <Text style={{ color: '#ef4444' }}>*</Text></Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome5 name="lock" size={16} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Répétez le mot de passe" placeholderTextColor="rgba(255,255,255,0.3)" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                            </View>
                        </>
                    )}

                    {step === 4 && (
                        <View style={{ alignItems: 'center', padding: 20 }}>
                            <FontAwesome5 name="check-circle" size={60} color="#10b981" style={{ marginBottom: 16 }} />
                            <Text style={[styles.title, { marginBottom: 8 }]}>Mot de passe réinitialisé !</Text>
                            <Text style={styles.subtitle}>Vous pouvez maintenant vous connecter</Text>
                        </View>
                    )}

                    {message ? <View style={[styles.messageBox, messageType === 'error' ? styles.messageError : styles.messageSuccess]}><Text style={[styles.messageText, messageType === 'error' ? { color: '#fca5a5' } : { color: '#6ee7b7' }]}>{message}</Text></View> : null}

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                        {(step === 1 || step === 2 || step === 3) && (
                            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => router.back()}>
                                <Text style={{ color: '#94a3b8', fontWeight: '600' }}>Annuler</Text>
                            </TouchableOpacity>
                        )}
                        {step === 1 && (
                            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={loadQuestions} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Chercher</Text>}
                            </TouchableOpacity>
                        )}
                        {step === 2 && (
                            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={verifyAnswers} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Vérifier</Text>}
                            </TouchableOpacity>
                        )}
                        {step === 3 && (
                            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={resetPassword} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Enregistrer</Text>}
                            </TouchableOpacity>
                        )}
                        {step === 4 && (
                            <TouchableOpacity style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={() => router.replace('/')}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Aller à la connexion</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    scroll: { padding: 20, paddingTop: 60, justifyContent: 'center', flex: 1 },
    card: { width: '100%', maxWidth: 460, alignSelf: 'center', backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
    logoWrapper: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '600', color: '#cbd5e1', marginBottom: 6 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 16 },
    inputIcon: { paddingLeft: 14 },
    input: { flex: 1, padding: 14, fontSize: 15, color: '#fff' },
    messageBox: { padding: 12, borderRadius: 10, marginTop: 8 },
    messageError: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    messageSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
    messageText: { fontSize: 13, textAlign: 'center' },
    btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnPrimary: { backgroundColor: '#6366f1' },
    btnSecondary: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
});