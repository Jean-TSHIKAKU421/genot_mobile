// ==========================================
// settings.tsx — COMPLET (compact, stats optimisées)
// ==========================================
import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Modal, Linking } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function SettingsScreen() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ courses: 0, notes: 0, pdfs: 0, links: 0 });
    const [online, setOnline] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [editModal, setEditModal] = useState(false);
    const [editType, setEditType] = useState('');
    const [editValue, setEditValue] = useState('');
    const [devImageIndex, setDevImageIndex] = useState(0);
    const devImages = [require('../../assets/images/dev1.jpg'), require('../../assets/images/dev2.jpg'), require('../../assets/images/dev3.jpg'), require('../../assets/images/dev4.jpg'), require('../../assets/images/dev5.jpg'), require('../../assets/images/dev6.jpg')];

    useEffect(() => { AsyncStorage.getItem('theme').then(t => { if (t) setTheme(t); }); const interval = setInterval(() => { setDevImageIndex(prev => (prev + 1) % devImages.length); }, 4000); return () => clearInterval(interval); }, []);

    const isDark = theme === 'dark';
    const colors = { bg: isDark ? '#020617' : '#f0f2f5', card: isDark ? '#0f172a' : '#ffffff', cardAlt: isDark ? '#1a1a2e' : '#f8fafc', text: isDark ? '#f1f5f9' : '#1a1a2e', textSec: isDark ? '#94a3b8' : '#64748b', border: isDark ? 'rgba(99,102,241,0.2)' : '#e2e8f0', inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', primary: '#6366f1', primaryLight: '#818cf8', success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const loadData = async () => {
        const u = await AsyncStorage.getItem('currentUser');
        if (!u) { router.replace('/'); return; }
        const userData = JSON.parse(u);
        setUser(userData);
        checkOnline();
        loadStats(userData.matricule);
    };

    const checkOnline = async () => { try { const r = await fetch(`${API_URL}/ping`); setOnline((await r.json()).success); } catch (e) { setOnline(false); } };

    // ==========================================
    // STATS OPTIMISÉES (2 requêtes)
    // ==========================================
    const loadStats = async (matricule) => {
        try {
            const r = await fetch(`${API_URL}/courses/${matricule}`);
            const d = await r.json();
            if (d.success) {
                const notes = d.allNotes || [];
                setStats({ courses: d.courses.length, notes: notes.filter(n => n.type === 'note').length, pdfs: notes.filter(n => n.type === 'support').length, links: notes.filter(n => n.type === 'link').length });
            }
        } catch (e) {}
    };

    const handleLogout = async () => { await AsyncStorage.removeItem('currentUser'); router.replace('/'); };
    const openEdit = (type, currentValue) => { setEditType(type); setEditValue(currentValue || ''); setEditModal(true); };
    const saveEdit = async () => {
        try { const r = await fetch(`${API_URL}/update-profile/${user.matricule}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [editType]: editValue }) }); const d = await r.json(); if (d.success) { setUser(d.user); await AsyncStorage.setItem('currentUser', JSON.stringify(d.user)); } else { Alert.alert('Erreur', d.message); } } catch (e) { Alert.alert('Erreur', 'Impossible de modifier.'); }
        setEditModal(false);
    };
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
        if (!result.canceled) { const fd = new FormData(); fd.append('photo', { uri: result.assets[0].uri, type: 'image/jpeg', name: 'profile.jpg' } as any); try { const r = await fetch(`${API_URL}/upload-profile-photo/${user.matricule}`, { method: 'POST', body: fd }); const d = await r.json(); if (d.success) { const updated = { ...user, photo: d.photoUrl }; setUser(updated); await AsyncStorage.setItem('currentUser', JSON.stringify(updated)); } } catch (e) {} }
    };

    if (!user) return <View style={[styles.container, { backgroundColor: colors.bg }]}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>Chargement...</Text></View>;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}><FontAwesome5 name="arrow-left" size={18} color={colors.primary} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Paramètres</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {user.photo ? <Image source={{ uri: API_URL.replace('/api', '') + user.photo }} style={styles.avatar} contentFit="cover" transition={200} cachePolicy="memory-disk" /> : <View style={styles.avatarPlaceholder}><FontAwesome5 name="user" size={60} color="#fff" /></View>}
                        <View style={styles.avatarBadge}><FontAwesome5 name="camera" size={14} color="#fff" /></View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.nom || '---'}</Text>
                    <Text style={[styles.userMatricule, { color: colors.textSec }]}>{user.matricule}</Text>

                    <View style={styles.infoGrid}>
                        <TouchableOpacity style={[styles.infoItem, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} onPress={() => openEdit('nom', user.nom)}><FontAwesome5 name="user" size={14} color={colors.primaryLight} /><Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{user.nom || '---'}</Text><FontAwesome5 name="pen" size={10} color={colors.textSec} /></TouchableOpacity>
                        <View style={[styles.infoItem, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}><FontAwesome5 name="id-card" size={14} color={colors.primaryLight} /><Text style={[styles.infoValue, { color: colors.text }]}>{user.matricule}</Text></View>
                        <TouchableOpacity style={[styles.infoItem, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} onPress={() => openEdit('email', user.email)}><FontAwesome5 name="envelope" size={14} color={colors.primaryLight} /><Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{user.email || 'Non renseigné'}</Text><FontAwesome5 name="pen" size={10} color={colors.textSec} /></TouchableOpacity>
                        <View style={[styles.infoItem, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}><FontAwesome5 name="palette" size={14} color={colors.primaryLight} /><Text style={[styles.infoValue, { color: colors.text }]}>{isDark ? '🌙 Sombre' : '☀️ Clair'}</Text></View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}><FontAwesome5 name="chart-bar" size={14} color={colors.primaryLight} /> Statistiques</Text>
                    <View style={styles.statsGrid}>
                        <StatBox icon="book" value={stats.courses} label="Cours" color={colors} />
                        <StatBox icon="sticky-note" value={stats.notes} label="Notes" color={colors} />
                        <StatBox icon="file-pdf" value={stats.pdfs} label="PDFs" color={colors} />
                        <StatBox icon="link" value={stats.links} label="Liens" color={colors} />
                    </View>

                    <View style={[styles.connectionBar, { backgroundColor: online ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderColor: online ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }]}>
                        <FontAwesome5 name="wifi" size={14} color={online ? colors.success : colors.danger} />
                        <Text style={{ color: online ? colors.success : colors.danger, fontSize: 13, fontWeight: '500', flex: 1, marginLeft: 10 }}>{online ? 'Connecté à Internet' : 'Pas de connexion'}</Text>
                        <View style={[styles.statusDot, { backgroundColor: online ? colors.success : colors.danger }]} />
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionHeading, { color: colors.text }]}><FontAwesome5 name="info-circle" size={16} color={colors.primaryLight} /> À propos de GeNot</Text>
                    <Text style={[styles.aboutDesc, { color: colors.textSec }]}>Plateforme de gestion des notes de cours conçue pour les étudiants. Centralisez vos cours, notes, supports PDF et liens utiles en un seul endroit. Ne perdez plus jamais vos précieuses ressources académiques !</Text>
                    <View style={styles.featureList}>
                        <FeatureItem icon="check-circle" text="Gestion des cours" color={colors} />
                        <FeatureItem icon="check-circle" text="Notes organisées" color={colors} />
                        <FeatureItem icon="check-circle" text="Supports PDF" color={colors} />
                        <FeatureItem icon="check-circle" text="Liens utiles" color={colors} />
                        <FeatureItem icon="check-circle" text="Corbeille sécurisée" color={colors} />
                        <FeatureItem icon="check-circle" text="Mode sombre/clair" color={colors} />
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionHeading, { color: colors.text }]}><FontAwesome5 name="code" size={16} color={colors.primaryLight} /> Développeur</Text>
                    <View style={styles.devHeader}><Image source={devImages[devImageIndex]} style={styles.devAvatarLarge} contentFit="cover" transition={600} /><Text style={[styles.devName, { color: colors.text }]}>Jean TSHIKAKU</Text><Text style={[styles.devRole, { color: colors.primaryLight }]}>Développeur Junior & Étudiant</Text></View>
                    <Text style={[styles.devBio, { color: colors.textSec }]}>Passionné par la technologie et l'innovation, je crée des solutions numériques pour faciliter la vie des étudiants. Ce projet est né de mon propre besoin d'organiser mes notes de cours.</Text>
                    <Text style={[styles.contactHeading, { color: colors.text }]}>Me contacter</Text>
                    <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} onPress={() => Linking.openURL('https://wa.me/243832976093')}><View style={[styles.contactIconW, { backgroundColor: 'rgba(37,211,102,0.15)' }]}><FontAwesome5 name="whatsapp" size={20} color="#25d366" /></View><View style={{ flex: 1 }}><Text style={[styles.contactLabel, { color: colors.textSec }]}>WhatsApp</Text><Text style={[styles.contactValue, { color: colors.text }]}>+243 83 29 760 93</Text></View><FontAwesome5 name="external-link-alt" size={12} color={colors.textSec} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} onPress={() => Linking.openURL('tel:+243999543276')}><View style={[styles.contactIconP, { backgroundColor: 'rgba(99,102,241,0.15)' }]}><FontAwesome5 name="phone-alt" size={18} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.contactLabel, { color: colors.textSec }]}>Appel</Text><Text style={[styles.contactValue, { color: colors.text }]}>+243 99 95 432 76</Text></View><FontAwesome5 name="external-link-alt" size={12} color={colors.textSec} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} onPress={() => Linking.openURL('mailto:jtshikaku@gmail.com')}><View style={[styles.contactIconE, { backgroundColor: 'rgba(239,68,68,0.15)' }]}><FontAwesome5 name="envelope" size={18} color={colors.danger} /></View><View style={{ flex: 1 }}><Text style={[styles.contactLabel, { color: colors.textSec }]}>Email</Text><Text style={[styles.contactValue, { color: colors.text }]}>jtshikaku@gmail.com</Text></View><FontAwesome5 name="external-link-alt" size={12} color={colors.textSec} /></TouchableOpacity>
                    <Text style={[styles.copyright, { color: colors.textSec }]}>© 2026 Jean TSHIKAKU. Tous droits réservés.</Text>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><FontAwesome5 name="sign-out-alt" size={16} color="#f87171" /><Text style={styles.logoutBtnText}> Se déconnecter</Text></TouchableOpacity>
            </ScrollView>

            <Modal visible={editModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Modifier {editType === 'nom' ? 'le nom' : "l'email"}</Text>
                        <TextInput style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} value={editValue} onChangeText={setEditValue} placeholder={editType === 'nom' ? 'Nouveau nom' : 'Nouvel email'} placeholderTextColor={colors.textSec} />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.inputBg }]} onPress={() => setEditModal(false)}><Text style={{ color: colors.text, fontWeight: '600' }}>Annuler</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={saveEdit}><Text style={{ color: '#fff', fontWeight: '600' }}>Enregistrer</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const StatBox = ({ icon, value, label, color }) => (<View style={[statStyles.box, { backgroundColor: color.cardAlt, borderColor: color.border }]}><FontAwesome5 name={icon} size={18} color={color.primaryLight} style={{ marginBottom: 6 }} /><Text style={[statStyles.value, { color: color.text }]}>{value}</Text><Text style={[statStyles.label, { color: color.textSec }]}>{label}</Text></View>);
const statStyles = StyleSheet.create({ box: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 }, value: { fontSize: 22, fontWeight: '800' }, label: { fontSize: 11, marginTop: 2, fontWeight: '500' } });
const FeatureItem = ({ icon, text, color }) => (<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}><FontAwesome5 name={icon} size={12} color={color.success} /><Text style={{ color: color.textSec, fontSize: 13 }}>{text}</Text></View>);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1 },
    headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 16, paddingBottom: 40 },
    section: { borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1 },
    avatarContainer: { alignSelf: 'center', marginBottom: 16, position: 'relative' },
    avatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: '#6366f1' },
    avatarPlaceholder: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
    avatarBadge: { position: 'absolute', bottom: 6, right: 6, width: 38, height: 38, borderRadius: 19, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
    userName: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
    userMatricule: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
    infoGrid: { gap: 8, marginBottom: 20 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
    infoValue: { flex: 1, fontSize: 13 },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
    statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    connectionBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
    aboutDesc: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
    featureList: { gap: 2 },
    devHeader: { alignItems: 'center', marginBottom: 16 },
    devAvatarLarge: { width: 160, height: 160, borderRadius: 80, borderWidth: 4, borderColor: '#6366f1', marginBottom: 14 },
    devName: { fontSize: 20, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
    devRole: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
    devBio: { fontSize: 13, lineHeight: 20, marginBottom: 18, textAlign: 'center' },
    contactHeading: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
    contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 8, borderWidth: 1 },
    contactIconW: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    contactIconP: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    contactIconE: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    contactLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    contactValue: { fontSize: 13, fontWeight: '600' },
    copyright: { fontSize: 11, textAlign: 'center', marginTop: 14 },
    logoutBtn: { flexDirection: 'row', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 50, padding: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    logoutBtnText: { color: '#f87171', fontSize: 15, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { width: '100%', borderRadius: 20, padding: 24, borderWidth: 1 },
    modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    modalInput: { borderWidth: 2, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16 },
    modalActions: { flexDirection: 'row', gap: 10 },
    modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
});