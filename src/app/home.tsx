import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function HomeScreen() {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [ready, setReady] = useState(false);
    const [theme, setTheme] = useState('dark');

    useEffect(() => { AsyncStorage.getItem('theme').then(t => { if (t) setTheme(t); }); }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
    };

    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? '#020617' : '#f0f2f5',
        card: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1a1a2e',
        textSec: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(99,102,241,0.2)' : '#e2e8f0',
        inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        primary: '#6366f1',
    };

    useFocusEffect(
        useCallback(() => { loadData(); }, [])
    );

    const loadData = async () => {
        const u = await AsyncStorage.getItem('currentUser');
        if (!u) { router.replace('/'); return; }
        const userData = JSON.parse(u);
        setUser(userData);
        try {
            const r = await fetch(`${API_URL}/courses/${userData.matricule}`);
            const data = await r.json();
            if (data.success) setCourses(data.courses);
        } catch (e) {}
        setReady(true);
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('currentUser');
        router.replace('/');
    };

    const getPrenom = (name) => {
        if (!name) return 'Utilisateur';
        const words = name.trim().split(/\s+/);
        return words.length > 1 ? words[words.length - 1] : words[0];
    };

    if (!ready) {
        return <View style={[styles.container, { backgroundColor: colors.bg }]}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>Chargement...</Text></View>;
    }

    const renderCourse = ({ item }) => (
        <TouchableOpacity style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(`/course?id=${item.id}`)}>
            {item.image_url ? (
                <Image source={{ uri: API_URL.replace('/api', '') + item.image_url }} style={styles.courseImage} />
            ) : (
                <View style={styles.courseImagePlaceholder}><Text style={styles.courseImagePlaceholderText}>📚</Text></View>
            )}
            <View style={styles.courseBody}>
                <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.courseProfessor, { color: colors.textSec }]}>👨‍🏫 {item.professor || '---------'}</Text>
                <Text style={[styles.courseMeta, { color: colors.textSec }]}>📝 {item.noteCount || 0} note(s)</Text>
                <Text style={styles.courseDate}>📅 {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                <View style={styles.courseActions}>
                    <TouchableOpacity style={styles.btnEnter} onPress={() => router.push(`/course?id=${item.id}`)}>
                        <Text style={styles.btnEnterText}>📖 Voir le cours</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnDelete} onPress={() => deleteCourse(item.id)}>
                        <Text style={styles.btnDeleteText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const deleteCourse = (id) => {
        Alert.alert('Supprimer', 'Mettre ce cours dans la corbeille ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: async () => {
                await fetch(`${API_URL}/courses/${id}`, { method: 'DELETE' });
                loadData();
            }},
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <Text style={{ fontSize: 50 }}>📚</Text>
                    <Text style={[styles.headerUserName, { color: colors.text }]}>{user ? getPrenom(user.nom) : ''}</Text>
                    <TouchableOpacity onPress={() => router.push('/settings')}>
                        {user?.photo ? (
                            <Image source={{ uri: API_URL.replace('/api', '') + user.photo }} style={styles.profilePhoto} />
                        ) : (
                            <View style={styles.profilePlaceholder}><Text style={styles.profilePlaceholderText}>{user ? getPrenom(user.nom).charAt(0).toUpperCase() : '?'}</Text></View>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={[styles.headerActions, { borderTopColor: colors.border }]}>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={toggleTheme}>
                        <Text style={styles.iconBtnText}>{isDark ? '☀️' : '🌙'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => router.push('/settings')}>
                        <Text style={styles.iconBtnText}>⚙️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => router.push('/trash')}>
                        <Text style={styles.iconBtnText}>🗑️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={handleLogout}>
                        <Text style={styles.iconBtnText}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={[styles.pageTitle, { color: colors.text }]}>📚 Mes Cours</Text>

            <FlatList
                data={courses}
                renderItem={renderCourse}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={styles.emptyIcon}>📖</Text>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun cours pour le moment</Text>
                        <Text style={[styles.emptyText, { color: colors.textSec }]}>Commencez par ajouter votre premier cours !</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-course')}>
                <Text style={styles.addBtnText}>➕ Ajouter un cours</Text>
            </TouchableOpacity>
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
    profilePlaceholderText: { color: '#fff', fontSize: 22, fontWeight: '700' },
    headerActions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14, paddingTop: 10, borderTopWidth: 1 },
    iconBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    iconBtnText: { fontSize: 20 },
    pageTitle: { fontSize: 20, fontWeight: '700', padding: 16, paddingBottom: 4 },
    list: { padding: 12, paddingTop: 0 },
    courseCard: { borderRadius: 20, marginBottom: 14, overflow: 'hidden', borderWidth: 1 },
    courseImage: { width: '100%', height: 160, resizeMode: 'cover' },
    courseImagePlaceholder: { width: '100%', height: 160, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
    courseImagePlaceholderText: { fontSize: 45 },
    courseBody: { padding: 16 },
    courseTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    courseProfessor: { fontSize: 13, marginBottom: 4 },
    courseMeta: { fontSize: 12, marginBottom: 2 },
    courseDate: { fontSize: 11, color: '#64748b', marginBottom: 14 },
    courseActions: { flexDirection: 'row', gap: 8 },
    btnEnter: { flex: 1, backgroundColor: '#6366f1', borderRadius: 50, padding: 10, alignItems: 'center' },
    btnEnterText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    btnDelete: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 50, padding: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    btnDeleteText: { fontSize: 16 },
    emptyState: { alignItems: 'center', padding: 50, borderRadius: 20, borderWidth: 1, marginHorizontal: 12 },
    emptyIcon: { fontSize: 50, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    emptyText: { fontSize: 13 },
    addBtn: { backgroundColor: '#6366f1', margin: 14, padding: 14, borderRadius: 50, alignItems: 'center' },
    addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});