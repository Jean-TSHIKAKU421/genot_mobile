import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function SettingsScreen() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ courses: 0, notes: 0, pdfs: 0, links: 0 });
    const [online, setOnline] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [editModal, setEditModal] = useState(false);
    const [editType, setEditType] = useState('');
    const [editValue, setEditValue] = useState('');

    useEffect(() => { AsyncStorage.getItem('theme').then(t => { if (t) setTheme(t); }); }, []);

    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? '#020617' : '#f0f2f5', card: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1a1a2e', textSec: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(99,102,241,0.2)' : '#e2e8f0', inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        primary: '#6366f1',
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const loadData = async () => {
        const u = await AsyncStorage.getItem('currentUser');
        if (!u) { router.replace('/'); return; }
        const localUser = JSON.parse(u);
        
        // Recharger depuis le serveur
        try {
            const r = await fetch(`${API_URL}/user/${localUser.matricule}`);
            const d = await r.json();
            if (d.success) {
                setUser(d.user);
                await AsyncStorage.setItem('currentUser', JSON.stringify(d.user));
            }
        } catch (e) {
            setUser(localUser);
        }
        
        checkOnline();
        loadStats(localUser.matricule);
    };

    const checkOnline = async () => { try { const r = await fetch(`${API_URL}/ping`); setOnline((await r.json()).success); } catch (e) { setOnline(false); } };

    const loadStats = async (matricule) => {
        try {
            const r = await fetch(`${API_URL}/courses/${matricule}`);
            const d = await r.json();
            if (d.success) {
                let totalNotes = 0, totalPdfs = 0, totalLinks = 0;
                for (const course of d.courses) {
                    try {
                        const nr = await fetch(`${API_URL}/course/${course.id}`);
                        const nd = await nr.json();
                        if (nd.success) {
                            totalNotes += nd.notes.filter(n => n.type === 'note').length;
                            totalPdfs += nd.notes.filter(n => n.type === 'support').length;
                            totalLinks += nd.notes.filter(n => n.type === 'link').length;
                        }
                    } catch (e) {}
                }
                setStats({ courses: d.courses.length, notes: totalNotes, pdfs: totalPdfs, links: totalLinks });
            }
        } catch (e) {}
    };

    const handleLogout = async () => { await AsyncStorage.removeItem('currentUser'); router.replace('/'); };

    const openEdit = (type, currentValue) => {
        setEditType(type);
        setEditValue(currentValue || '');
        setEditModal(true);
    };

    const saveEdit = async () => {
        try {
            const r = await fetch(`${API_URL}/update-profile/${user.matricule}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [editType]: editValue })
            });
            const d = await r.json();
            if (d.success) {
                setUser(d.user);
                await AsyncStorage.setItem('currentUser', JSON.stringify(d.user));
            } else { Alert.alert('Erreur', d.message); }
        } catch (e) { Alert.alert('Erreur', 'Impossible de modifier.'); }
        setEditModal(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
        if (!result.canceled) {
            const formData = new FormData();
            formData.append('photo', { uri: result.assets[0].uri, type: 'image/jpeg', name: 'profile.jpg' });
            try {
                const r = await fetch(`${API_URL}/upload-profile-photo/${user.matricule}`, { method: 'POST', body: formData });
                const d = await r.json();
                if (d.success) {
                    const updated = { ...user, photo: d.photoUrl };
                    setUser(updated);
                    await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
                }
            } catch (e) {}
        }
    };

    if (!user) return <View style={[styles.container, { backgroundColor: colors.bg }]}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>Chargement...</Text></View>;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}><Text style={{ color: colors.primary, fontSize: 16 }}>← Retour</Text></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>⚙️ Paramètres</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profil */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.profileCenter}>
                        <TouchableOpacity onPress={pickImage}>
                            {user.photo ? (
                                <Image source={{ uri: API_URL.replace('/api', '') + user.photo }} style={styles.avatarLarge} />
                            ) : (
                                <View style={styles.avatarLargePlaceholder}><Text style={{ fontSize: 50 }}>👤</Text></View>
                            )}
                            <Text style={styles.changePhoto}>📷 Modifier</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoList}>
                        <TouchableOpacity style={[styles.infoRow, { backgroundColor: colors.inputBg }]} onPress={() => openEdit('nom', user.nom)}>
                            <Text style={[styles.infoLabel, { color: colors.textSec }]}>Nom complet</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{user.nom || '---'} ✏️</Text>
                        </TouchableOpacity>
                        <View style={[styles.infoRow, { backgroundColor: colors.inputBg }]}>
                            <Text style={[styles.infoLabel, { color: colors.textSec }]}>Matricule</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{user.matricule}</Text>
                        </View>
                        <TouchableOpacity style={[styles.infoRow, { backgroundColor: colors.inputBg }]} onPress={() => openEdit('email', user.email)}>
                            <Text style={[styles.infoLabel, { color: colors.textSec }]}>Email</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{user.email || 'Non renseigné'} ✏️</Text>
                        </TouchableOpacity>
                        <View style={[styles.infoRow, { backgroundColor: colors.inputBg }]}>
                            <Text style={[styles.infoLabel, { color: colors.textSec }]}>Thème</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{isDark ? '🌙 Sombre' : '☀️ Clair'}</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>📊 Statistiques</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: colors.inputBg }]}><Text style={styles.statNumber}>{stats.courses}</Text><Text style={[styles.statLabel, { color: colors.textSec }]}>Cours</Text></View>
                        <View style={[styles.statCard, { backgroundColor: colors.inputBg }]}><Text style={styles.statNumber}>{stats.notes}</Text><Text style={[styles.statLabel, { color: colors.textSec }]}>Notes</Text></View>
                        <View style={[styles.statCard, { backgroundColor: colors.inputBg }]}><Text style={styles.statNumber}>{stats.pdfs}</Text><Text style={[styles.statLabel, { color: colors.textSec }]}>PDFs</Text></View>
                        <View style={[styles.statCard, { backgroundColor: colors.inputBg }]}><Text style={styles.statNumber}>{stats.links}</Text><Text style={[styles.statLabel, { color: colors.textSec }]}>Liens</Text></View>
                    </View>

                    <View style={[styles.connectionRow, { backgroundColor: colors.inputBg }]}>
                        <View style={[styles.statusDot, { backgroundColor: online ? '#10b981' : '#ef4444' }]} />
                        <Text style={{ color: online ? '#10b981' : '#ef4444', fontSize: 13, flex: 1 }} numberOfLines={1}>{online ? '✅ Connecté à Internet' : '❌ Pas de connexion'}</Text>
                    </View>
                </View>

                {/* À propos */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.primary }]}>ℹ️ À propos</Text>
                    <Text style={[styles.aboutText, { color: colors.textSec }]}>Plateforme de gestion des notes de cours pour étudiants. Centralisez vos cours, notes, PDFs et liens.</Text>
                    <View style={styles.featureRow}>
                        <Text style={[styles.feature, { color: colors.textSec }]}>✅ Cours</Text>
                        <Text style={[styles.feature, { color: colors.textSec }]}>✅ Notes</Text>
                        <Text style={[styles.feature, { color: colors.textSec }]}>✅ PDFs</Text>
                        <Text style={[styles.feature, { color: colors.textSec }]}>✅ Corbeille</Text>
                    </View>
                </View>

                {/* Développeur */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.primary }]}>👨‍💻 Développeur</Text>
                    <View style={styles.devCenter}>
                        <View style={styles.devAvatar}><Text style={styles.devAvatarText}>JT</Text></View>
                        <Text style={[styles.devName, { color: colors.text }]}>Jean TSHIKAKU</Text>
                        <Text style={[styles.devRole, { color: colors.primary }]}>Développeur Junior & Etudiant à UDBL</Text>
                    </View>
                    <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.inputBg }]} onPress={() => Linking.openURL('https://wa.me/243832976093')}>
                        <Text style={styles.contactIcon}>💬</Text><View style={{ flex: 1 }}><Text style={[styles.contactLabel, { color: colors.textSec }]}>WhatsApp</Text><Text style={[styles.contactValue, { color: colors.text }]}>+243 83 29 760 93</Text></View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.inputBg }]} onPress={() => Linking.openURL('tel:+243999543276')}>
                        <Text style={styles.contactIcon}>📞</Text><View style={{ flex: 1 }}><Text style={[styles.contactLabel, { color: colors.textSec }]}>Appel</Text><Text style={[styles.contactValue, { color: colors.text }]}>+243 99 95 432 76</Text></View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.inputBg }]} onPress={() => Linking.openURL('mailto:jtshikaku@gmail.com')}>
                        <Text style={styles.contactIcon}>📧</Text><View style={{ flex: 1 }}><Text style={[styles.contactLabel, { color: colors.textSec }]}>Email</Text><Text style={[styles.contactValue, { color: colors.text }]}>jtshikaku@gmail.com</Text></View>
                    </TouchableOpacity>
                    <Text style={[styles.copyright, { color: colors.textSec }]}>© 2026 Jean TSHIKAKU</Text>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutBtnText}>🚪 Se déconnecter</Text></TouchableOpacity>
            </ScrollView>

            {/* Modal édition */}
            <Modal visible={editModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Modifier {editType === 'nom' ? 'le nom' : 'l\'email'}</Text>
                        <TextInput style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} value={editValue} onChangeText={setEditValue} placeholder={editType === 'nom' ? 'Nouveau nom' : 'Nouvel email'} placeholderTextColor={colors.textSec} />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.inputBg }]} onPress={() => setEditModal(false)}><Text style={{ color: colors.text }}>Annuler</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={saveEdit}><Text style={{ color: '#fff' }}>Enregistrer</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 14, paddingBottom: 40 },
    card: { borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
    profileCenter: { alignItems: 'center', marginBottom: 18 },
    avatarLarge: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#6366f1' },
    avatarLargePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
    changePhoto: { color: '#818cf8', fontSize: 12, marginTop: 6, textAlign: 'center' },
    profileName: { fontSize: 20, fontWeight: '700', marginTop: 10 },
    profileMatricule: { fontSize: 13, marginTop: 4 },
    infoList: { gap: 6, marginBottom: 14 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 8 },
    infoLabel: { fontSize: 11, fontWeight: '600' },
    infoValue: { fontSize: 12, flex: 1, textAlign: 'right', marginLeft: 8 },
    sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statCard: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
    statNumber: { fontSize: 22, fontWeight: '800', color: '#818cf8' },
    statLabel: { fontSize: 10, marginTop: 2 },
    connectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    aboutText: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
    featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    feature: { fontSize: 12 },
    devCenter: { alignItems: 'center', marginBottom: 16 },
    devAvatar: { width: 55, height: 55, borderRadius: 27, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    devAvatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
    devName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    devRole: { fontSize: 12, marginBottom: 14 },
    contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, marginBottom: 6 },
    contactIcon: { fontSize: 20 },
    contactLabel: { fontSize: 10, textTransform: 'uppercase' },
    contactValue: { fontSize: 13, fontWeight: '600' },
    copyright: { fontSize: 11, textAlign: 'center', marginTop: 8 },
    logoutBtn: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 50, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    logoutBtnText: { color: '#f87171', fontSize: 14, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { width: '100%', borderRadius: 16, padding: 24, borderWidth: 1 },
    modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    modalInput: { borderWidth: 2, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 },
    modalActions: { flexDirection: 'row', gap: 10 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
});