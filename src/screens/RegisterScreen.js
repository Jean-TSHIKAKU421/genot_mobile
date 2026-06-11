import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
    const [nom, setNom] = useState('');
    const [matricule, setMatricule] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [question1, setQuestion1] = useState('');
    const [reponse1, setReponse1] = useState('');
    const [question2, setQuestion2] = useState('');
    const [reponse2, setReponse2] = useState('');
    const [loading, setLoading] = useState(false);

    const questions = [
        "Quel est le nom de votre premier animal de compagnie ?",
        "Quel est le nom de votre école primaire ?",
        "Quelle est la ville de naissance de votre mère ?",
        "Quel est votre plat préféré ?",
        "Quel est le nom de votre meilleur(e) ami(e) d'enfance ?",
        "Quel est votre sport préféré ?",
    ];

    const handleRegister = async () => {
        if (!nom || !matricule || !password || !question1 || !reponse1 || !question2 || !reponse2) {
            Alert.alert('Erreur', 'Tous les champs obligatoires sont requis.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            const data = await api.register({ nom, matricule, email, password, question1, reponse1, question2, reponse2 });
            if (data.success) {
                Alert.alert('Succès', 'Compte créé avec succès !', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            } else {
                Alert.alert('Erreur', data.message);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    const renderPicker = (label, value, setValue) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                {questions.map((q, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.pickerItem, value === q && styles.pickerItemSelected]}
                        onPress={() => setValue(q)}
                    >
                        <Text style={[styles.pickerItemText, value === q && styles.pickerItemTextSelected]} numberOfLines={2}>
                            {q}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={styles.logo}>📝</Text>
                    <Text style={styles.title}>Créer un compte</Text>
                    <Text style={styles.subtitle}>Rejoignez GeNot</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nom complet *</Text>
                        <TextInput style={styles.input} placeholder="Votre nom complet" placeholderTextColor="#94a3b8" value={nom} onChangeText={setNom} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Matricule *</Text>
                        <TextInput style={styles.input} placeholder="Ex: 24TM421SI" placeholderTextColor="#94a3b8" value={matricule} onChangeText={setMatricule} autoCapitalize="none" />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email (optionnel)</Text>
                        <TextInput style={styles.input} placeholder="prenom.nom@example.com" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mot de passe *</Text>
                        <TextInput style={styles.input} placeholder="Minimum 8 caractères" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirmer le mot de passe *</Text>
                        <TextInput style={styles.input} placeholder="Répétez le mot de passe" placeholderTextColor="#94a3b8" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                    </View>

                    {renderPicker('Question de sécurité 1 *', question1, setQuestion1)}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Réponse 1 *</Text>
                        <TextInput style={styles.input} placeholder="Votre réponse" placeholderTextColor="#94a3b8" value={reponse1} onChangeText={setReponse1} />
                    </View>

                    {renderPicker('Question de sécurité 2 *', question2, setQuestion2)}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Réponse 2 *</Text>
                        <TextInput style={styles.input} placeholder="Votre réponse" placeholderTextColor="#94a3b8" value={reponse2} onChangeText={setReponse2} />
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleRegister} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Créer mon compte</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text></Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        borderRadius: 24,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(99,102,241,0.2)',
    },
    logo: { fontSize: 50, textAlign: 'center', marginBottom: 8 },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 30 },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#cbd5e1', marginBottom: 6 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#fff',
    },
    pickerScroll: { marginTop: 4 },
    pickerItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 12,
        marginRight: 8,
        maxWidth: 250,
    },
    pickerItemSelected: { borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)' },
    pickerItemText: { color: '#94a3b8', fontSize: 13 },
    pickerItemTextSelected: { color: '#a5b4fc' },
    loginBtn: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    link: { color: '#94a3b8', textAlign: 'center', fontSize: 14 },
    linkBold: { color: '#818cf8', fontWeight: '700' },
});