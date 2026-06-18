import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';
const PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export default function HomeScreen() {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [ready, setReady] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => { AsyncStorage.getItem('theme').then(t => { if (t) setTheme(t); }); }, []);

    const toggleTheme = async () => { const newTheme = theme === 'dark' ? 'light' : 'dark'; setTheme(newTheme); await AsyncStorage.setItem('theme', newTheme); };

    const isDark = theme === 'dark';
    const colors = { bg: isDark ? '#020617' : '#f0f2f5', card: isDark ? '#0f172a' : '#ffffff', text: isDark ? '#f1f5f9' : '#1a1a2e', textSec: isDark ? '#94a3b8' : '#64748b', border: isDark ? 'rgba(99,102,241,0.2)' : '#e2e8f0', inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', primary: '#6366f1', danger: '#ef4444', warning: '#f59e0b', success: '#10b981' };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const loadData = async () => {
        const u = await AsyncStorage.getItem('currentUser');
        if (!u) { router.replace('/'); return; }
        const userData = JSON.parse(u);
        setUser(userData);
        fetch(`${API_URL}/visits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: 'mobile', page: 'home', matricule: userData.matricule }) }).catch(() => {});
        try {
            const r = await fetch(`${API_URL}/courses/${userData.matricule}`);
            const data = await r.json();
            if (data.success) setCourses(data.courses);
        } catch (e) {}
        setReady(true);
    };

    const handleLogout = async () => { await AsyncStorage.removeItem('currentUser'); router.replace('/'); };

    const getPrenom = (name) => { if (!name) return 'Utilisateur'; const words = name.trim().split(/\s+/); return words.length > 1 ? words[words.length - 1] : words[0]; };

    const handleSearch = (term) => { setSearchTerm(term); if (!term.trim()) { setFilteredCourses([]); return; } const t = term.toLowerCase().trim(); setFilteredCourses(courses.filter(c => (c.title||'').toLowerCase().includes(t) || (c.professor||'').toLowerCase().includes(t) || (c.description||'').toLowerCase().includes(t))); };

    const toggleVoiceSearch = async () => { if (isListening) { setIsListening(false); return; } try { const { default: SpeechRecognition } = await import('expo-speech-recognition'); setIsListening(true); const result = await SpeechRecognition.startListening({ language: 'fr-FR', continuous: false }); if (result && result.transcript) { setSearchTerm(result.transcript); handleSearch(result.transcript); } } catch (e) { Alert.alert('Info', 'Micro non disponible.'); } finally { setIsListening(false); } };

    if (!ready) return <View style={[styles.container, { backgroundColor: colors.bg }]}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>Chargement...</Text></View>;

    const displayCourses = filteredCourses.length > 0 || searchTerm.length > 0 ? filteredCourses : courses;

    const renderCourse = ({ item }) => (
        <TouchableOpacity style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push({ pathname: '/course', params: { id: item.id } })}>
            {item.image_url ? <Image source={{ uri: API_URL.replace('/api', '') + item.image_url }} style={styles.courseImage} contentFit="cover" transition={300} cachePolicy="memory-disk" placeholder={{ uri: PLACEHOLDER }} /> : <View style={styles.courseImagePlaceholder}><FontAwesome5 name="book" size={45} color="#fff" /></View>}
            <View style={styles.courseBody}>
                <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <View style={styles.courseRow}><FontAwesome5 name="user-tie" size={12} color={colors.primary} /><Text style={[styles.courseProfessor, { color: colors.textSec }]}> {item.professor || '---------'}</Text></View>
                <Text style={[styles.courseMeta, { color: colors.textSec }]}>📝 {item.noteCount || 0} note(s)</Text>
                <Text style={styles.courseDate}>📅 {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                <View style={styles.courseActions}>
                    <TouchableOpacity style={styles.btnEnter} onPress={() => router.push({ pathname: '/course', params: { id: item.id } })}><FontAwesome5 name="eye" size={14} color="#fff" /><Text style={styles.btnEnterText}> Voir</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.btnEdit} onPress={() => router.push({ pathname: '/edit-course', params: { id: item.id } })}><FontAwesome5 name="edit" size={16} color={colors.warning} /></TouchableOpacity>
                    <TouchableOpacity style={styles.btnDelete} onPress={() => deleteCourse(item.id)}><FontAwesome5 name="trash-alt" size={16} color={colors.danger} /></TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const deleteCourse = (id) => { Alert.alert('Supprimer', 'Mettre ce cours dans la corbeille ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Supprimer', style: 'destructive', onPress: async () => { await fetch(`${API_URL}/courses/${id}`, { method: 'DELETE' }); loadData(); } }]); };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <FontAwesome5 name="book" size={40} color={colors.primary} />
                    <Text style={[styles.headerUserName, { color: colors.text }]}>{user ? getPrenom(user.nom) : ''}</Text>
                    <TouchableOpacity onPress={() => router.push('/settings')}>{user?.photo ? <Image source={{ uri: API_URL.replace('/api', '') + user.photo }} style={styles.profilePhoto} contentFit="cover" transition={200} cachePolicy="memory-disk" /> : <View style={styles.profilePlaceholder}><FontAwesome5 name="user" size={22} color="#fff" /></View>}</TouchableOpacity>
                </View>
                <View style={[styles.headerActions, { borderTopColor: colors.border }]}>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={toggleTheme}><FontAwesome5 name={isDark ? 'sun' : 'moon'} size={18} color={colors.text} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => router.push('/settings')}><FontAwesome5 name="cog" size={18} color={colors.text} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => router.push('/trash')}><FontAwesome5 name="trash-alt" size={18} color={colors.text} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={handleLogout}><FontAwesome5 name="sign-out-alt" size={18} color={colors.text} /></TouchableOpacity>
                </View>
            </View>

            <Text style={[styles.pageTitle, { color: colors.text }]}>📚 Mes Cours</Text>

            <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <FontAwesome5 name="search" size={16} color={colors.textSec} style={{ marginRight: 8 }} />
                <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Rechercher un cours..." placeholderTextColor={colors.textSec} value={searchTerm} onChangeText={handleSearch} />
                {searchTerm.length > 0 && <TouchableOpacity onPress={() => { setSearchTerm(''); setFilteredCourses([]); }}><FontAwesome5 name="times" size={16} color={colors.textSec} style={{ marginRight: 8 }} /></TouchableOpacity>}
                <TouchableOpacity style={[styles.micBtn, isListening && { backgroundColor: '#ef4444' }]} onPress={toggleVoiceSearch}><FontAwesome5 name="microphone" size={16} color={isListening ? '#fff' : colors.textSec} /></TouchableOpacity>
            </View>

            <FlatList data={displayCourses} renderItem={renderCourse} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.list}
                ListEmptyComponent={<View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}><FontAwesome5 name="book-open" size={50} color={colors.textSec} style={{ marginBottom: 12 }} /><Text style={[styles.emptyTitle, { color: colors.text }]}>{searchTerm ? `Aucun cours pour "${searchTerm}"` : 'Aucun cours'}</Text><Text style={[styles.emptyText, { color: colors.textSec }]}>{searchTerm ? "Essayez d'autres mots-clés" : 'Ajoutez votre premier cours !'}</Text></View>}
            />

            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-course')}><FontAwesome5 name="plus" size={16} color="#fff" /><Text style={styles.addBtnText}> Ajouter un cours</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 12, paddingTop: 50, borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    headerUserName: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
    profilePhoto: { width: 55, height: 55, borderRadius: 27, borderWidth: 2, borderColor: '#6366f1' },
    profilePlaceholder: { width: 55, height: 55, borderRadius: 27, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
    headerActions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14, paddingTop: 10, borderTopWidth: 1 },
    iconBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    pageTitle: { fontSize: 20, fontWeight: '700', padding: 16, paddingBottom: 4 },
    searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 8, marginBottom: 4, paddingHorizontal: 14, borderRadius: 50, borderWidth: 1, height: 46 },
    searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
    micBtn: { marginLeft: 4, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 12, paddingTop: 8 },
    courseCard: { borderRadius: 20, marginBottom: 14, overflow: 'hidden', borderWidth: 1 },
    courseImage: { width: '100%', height: 160 },
    courseImagePlaceholder: { width: '100%', height: 160, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
    courseBody: { padding: 16 },
    courseTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    courseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    courseProfessor: { fontSize: 13 },
    courseMeta: { fontSize: 12, marginBottom: 2 },
    courseDate: { fontSize: 11, color: '#64748b', marginBottom: 14 },
    courseActions: { flexDirection: 'row', gap: 6 },
    btnEnter: { flex: 1, backgroundColor: '#6366f1', borderRadius: 50, padding: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    btnEnterText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    btnEdit: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 50, padding: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
    btnDelete: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 50, padding: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    emptyState: { alignItems: 'center', padding: 50, borderRadius: 20, borderWidth: 1, marginHorizontal: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    emptyText: { fontSize: 13 },
    addBtn: { backgroundColor: '#6366f1', margin: 14, padding: 14, borderRadius: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});