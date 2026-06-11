import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';

const QUESTIONS = [
    "Quel est le nom de votre premier animal de compagnie ?",
    "Quel est le nom de votre école primaire ?",
    "Quelle est la ville de naissance de votre mère ?",
    "Quel est votre plat préféré ?",
    "Quel est le nom de votre meilleur(e) ami(e) d'enfance ?",
    "Quel est votre sport préféré ?",
];

export default function RegisterScreen() {
    const [nom, setNom] = useState('');
    const [matricule, setMatricule] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [question1, setQuestion1] = useState('');
    const [reponse1, setReponse1] = useState('');
    const [question2, setQuestion2] = useState('');
    const [reponse2, setReponse2] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleRegister = async () => {
        if (!nom || !matricule || !password || !question1 || !reponse1 || !question2 || !reponse2) {
            setMessage('Tous les champs obligatoires doivent être remplis.');
            setMessageType('error');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Les mots de passe ne correspondent pas.');
            setMessageType('error');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const r = await fetch(`${API_URL}/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, matricule, email, password, question1, reponse1, question2, reponse2 })
            });
            const data = await r.json();
            if (data.success) {
                setMessage('✅ Compte créé avec succès ! Redirection...');
                setMessageType('success');
                setTimeout(() => router.replace('/'), 1500);
            } else {
                setMessage(data.message);
                setMessageType('error');
            }
        } catch (e) {
            setMessage('Impossible de contacter le serveur.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const renderQuestionSelector = (label, selected, setSelected) => (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionScroll}>
                {QUESTIONS.map((q, i) => (
                    <TouchableOpacity key={i} style={[styles.questionItem, selected === q && styles.questionItemSelected]} onPress={() => setSelected(q)}>
                        <Text style={[styles.questionItemText, selected === q && styles.questionItemTextSelected]} numberOfLines={3}>{q}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.bgParticle1} />
            <View style={styles.bgParticle2} />
            <View style={styles.bgParticle3} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.logoWrapper}><Text style={styles.logoText}>📝</Text></View>
                    <Text style={styles.title}>Créer votre compte</Text>
                    <Text style={styles.subtitle}>Rejoignez la plateforme de gestion des notes</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nom complet <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>👤</Text>
                            <TextInput style={styles.input} placeholder="Votre nom complet" placeholderTextColor="rgba(255,255,255,0.3)" value={nom} onChangeText={setNom} />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Matricule <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>🪪</Text>
                            <TextInput style={styles.input} placeholder="Ex: 24TM421SI" placeholderTextColor="rgba(255,255,255,0.3)" value={matricule} onChangeText={setMatricule} autoCapitalize="none" />
                        </View>
                        <Text style={styles.hint}>Votre matricule étudiant unique</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email <Text style={styles.optional}>(optionnel)</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>📧</Text>
                            <TextInput style={styles.input} placeholder="prenom.nom@example.com" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Mot de passe <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput style={styles.input} placeholder="Minimum 8 caractères" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Confirmer le mot de passe <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput style={styles.input} placeholder="Répétez le mot de passe" placeholderTextColor="rgba(255,255,255,0.3)" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm} />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                                <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {renderQuestionSelector('Question de sécurité 1', question1, setQuestion1)}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Réponse 1 <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>✏️</Text>
                            <TextInput style={styles.input} placeholder="Votre réponse" placeholderTextColor="rgba(255,255,255,0.3)" value={reponse1} onChangeText={setReponse1} />
                        </View>
                    </View>

                    {renderQuestionSelector('Question de sécurité 2', question2, setQuestion2)}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Réponse 2 <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>✏️</Text>
                            <TextInput style={styles.input} placeholder="Votre réponse" placeholderTextColor="rgba(255,255,255,0.3)" value={reponse2} onChangeText={setReponse2} />
                        </View>
                    </View>

                    {message ? (
                        <View style={[styles.messageBox, messageType === 'error' ? styles.messageError : styles.messageSuccess]}>
                            <Text style={[styles.messageText, messageType === 'error' ? styles.messageTextError : styles.messageTextSuccess]}>{message}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity style={styles.loginBtn} onPress={handleRegister} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Créer mon compte</Text>}
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                        Déjà un compte ? <Text style={styles.footerLink} onPress={() => router.back()}>Se connecter</Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    bgParticle1: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: '#6366f1', opacity: 0.08, top: -100, right: -100 },
    bgParticle2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#06b6d4', opacity: 0.08, bottom: -80, left: -80 },
    bgParticle3: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#8b5cf6', opacity: 0.08, top: '50%', left: '50%', marginLeft: -125, marginTop: -125 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: { width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
    logoWrapper: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
    logoText: { fontSize: 36 },
    title: { fontSize: 26, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 28 },
    formGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '600', color: '#cbd5e1', marginBottom: 6 },
    required: { color: '#ef4444' },
    optional: { color: '#64748b', fontWeight: '400' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
    inputIcon: { fontSize: 16, paddingLeft: 14 },
    input: { flex: 1, padding: 14, fontSize: 15, color: '#fff' },
    eyeBtn: { paddingHorizontal: 14 },
    eyeIcon: { fontSize: 18 },
    hint: { fontSize: 11, color: '#64748b', marginTop: 4 },
    questionScroll: { marginTop: 4 },
    questionItem: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, marginRight: 8, maxWidth: 220 },
    questionItemSelected: { borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)' },
    questionItemText: { color: '#94a3b8', fontSize: 12, lineHeight: 18 },
    questionItemTextSelected: { color: '#a5b4fc' },
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