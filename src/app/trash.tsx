import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function TrashScreen() {
    const [courses, setCourses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('dark');

    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? '#020617' : '#f0f2f5', card: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1a1a2e', textSec: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(99,102,241,0.2)' : '#e2e8f0', inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        primary: '#6366f1', success: '#10b981', danger: '#ef4444',
    };

    useFocusEffect(useCallback(() => { loadTrash(); }, []));

    const loadTrash = async () => {
        const u = await AsyncStorage.getItem('currentUser');
        if (!u) { router.replace('/'); return; }
        const user = JSON.parse(u);
        try {
            const r = await fetch(`${API_URL}/trash/${user.matricule}`);
            const d = await r.json();
            if (d.success) { setCourses(d.courses); setNotes(d.notes); }
        } catch (e) {}
        setLoading(false);
    };

    const restoreItem = async (type, id) => {
        try {
            await fetch(`${API_URL}/trash/restore/${type}/${id}`, { method: 'POST' });
            loadTrash();
        } catch (e) { Alert.alert('Erreur', 'Impossible de restaurer.'); }
    };

    const permanentDelete = (type, id) => {
        Alert.alert('⚠️ Suppression définitive', 'Cette action est irréversible !', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: async () => {
                await fetch(`${API_URL}/trash/permanent/${type}/${id}`, { method: 'DELETE' });
                loadTrash();
            }},
        ]);
    };

    const emptyTrash = () => {
        Alert.alert('⚠️ Vider la corbeille', 'Tout supprimer définitivement ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Vider', style: 'destructive', onPress: async () => {
                const u = await AsyncStorage.getItem('currentUser');
                const user = JSON.parse(u);
                await fetch(`${API_URL}/trash/empty/${user.matricule}`, { method: 'POST' });
                loadTrash();
            }},
        ]);
    };

    const totalItems = courses.length + notes.length;

    if (loading) return <View style={[styles.container, { backgroundColor: colors.bg }]}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>Chargement...</Text></View>;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}><Text style={{ color: colors.primary, fontSize: 16 }}>← Retour</Text></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>🗑️ Corbeille</Text>
                {totalItems > 0 ? (
                    <TouchableOpacity onPress={emptyTrash}><Text style={{ color: colors.danger, fontSize: 13 }}>Vider</Text></TouchableOpacity>
                ) : <View style={{ width: 40 }} />}
            </View>

            <FlatList
                data={[...courses.map(c => ({ ...c, itemType: 'course' })), ...notes.map(n => ({ ...n, itemType: 'note' }))]}
                keyExtractor={item => `${item.itemType}-${item.id}`}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Corbeille vide</Text>
                        <Text style={[styles.emptyText, { color: colors.textSec }]}>Aucun élément supprimé</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={[styles.trashItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.trashIcon}>
                            <Text style={{ fontSize: 24 }}>{item.itemType === 'course' ? '📚' : '📝'}</Text>
                        </View>
                        <View style={styles.trashInfo}>
                            <Text style={[styles.trashTitle, { color: colors.text }]} numberOfLines={1}>
                                {item.itemType === 'course' ? item.title : item.title}
                            </Text>
                            <Text style={[styles.trashMeta, { color: colors.textSec }]}>
                                {item.itemType === 'course' ? 'Cours' : `Cours: ${item.course_title || ''}`} • {new Date(item.deleted_at).toLocaleDateString('fr-FR')}
                            </Text>
                        </View>
                        <View style={styles.trashActions}>
                            <TouchableOpacity style={[styles.restoreBtn, { backgroundColor: colors.success }]} onPress={() => restoreItem(item.itemType, item.id)}>
                                <Text style={styles.restoreBtnText}>↩️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: colors.danger }]} onPress={() => permanentDelete(item.itemType, item.id)}>
                                <Text style={styles.deleteBtnText}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    list: { padding: 14, paddingBottom: 40 },
    trashItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 8, borderWidth: 1 },
    trashIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(99,102,241,0.1)', justifyContent: 'center', alignItems: 'center' },
    trashInfo: { flex: 1 },
    trashTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    trashMeta: { fontSize: 11 },
    trashActions: { flexDirection: 'row', gap: 6 },
    restoreBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    restoreBtnText: { fontSize: 16 },
    deleteBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    deleteBtnText: { fontSize: 14 },
    emptyState: { alignItems: 'center', padding: 50, borderRadius: 20, borderWidth: 1 },
    emptyIcon: { fontSize: 50, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    emptyText: { fontSize: 13 },
});