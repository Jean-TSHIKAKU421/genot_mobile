import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function AdminScreen() {
    const [stats, setStats] = useState({ users: 0, courses: 0, notes: 0, pdfs: 0, links: 0 });
    const [sqlQuery, setSqlQuery] = useState('');
    const [sqlResult, setSqlResult] = useState(null);
    const [sqlError, setSqlError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [ready, setReady] = useState(false);

    const colors = { bg: '#020617', card: '#0f172a', text: '#f1f5f9', textSec: '#94a3b8', border: 'rgba(99,102,241,0.2)', inputBg: 'rgba(255,255,255,0.05)', primary: '#6366f1', success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };

    useFocusEffect(useCallback(() => { loadStats(); }, []));

    const loadStats = async () => {
        try {
            const r = await fetch(`${API_URL}/admin/stats`);
            const d = await r.json();
            if (d.success && d.stats) { setStats(d.stats); }
        } catch (e) { Alert.alert('Erreur', 'Échec de connexion au serveur.'); }
        setReady(true);
    };

    const executeSQL = async () => {
        if (!sqlQuery.trim()) return;
        setLoading(true); setSqlError(''); setSqlResult(null);
        try {
            const r = await fetch(`${API_URL}/admin/sql`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: sqlQuery }) });
            const d = await r.json();
            if (d.success) { setSqlResult(d); } else { setSqlError(d.message); }
        } catch (e) { setSqlError('Erreur de connexion.'); }
        setLoading(false);
    };

    if (!ready) return <View style={[styles.container, { backgroundColor: colors.bg }]}><ActivityIndicator color={colors.primary} style={{ marginTop: 100 }} /></View>;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.replace('/')}><Text style={{ color: colors.primary, fontSize: 16 }}>← Sortir</Text></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>🛡️ Admin Panel</Text>
                <TouchableOpacity onPress={loadStats}><FontAwesome5 name="sync" size={16} color={colors.primary} /></TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === 'dashboard' && { backgroundColor: colors.primary }]} onPress={() => setActiveTab('dashboard')}>
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'sql' && { backgroundColor: colors.primary }]} onPress={() => setActiveTab('sql')}>
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>SQL</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'dashboard' && (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { borderColor: colors.primary }]}><Text style={[styles.statNum, { color: colors.primary }]}>{stats.users}</Text><Text style={styles.statLab}>Utilisateurs</Text></View>
                        <View style={[styles.statBox, { borderColor: colors.success }]}><Text style={[styles.statNum, { color: colors.success }]}>{stats.courses}</Text><Text style={styles.statLab}>Cours</Text></View>
                        <View style={[styles.statBox, { borderColor: colors.warning }]}><Text style={[styles.statNum, { color: colors.warning }]}>{stats.notes}</Text><Text style={styles.statLab}>Notes</Text></View>
                        <View style={[styles.statBox, { borderColor: colors.danger }]}><Text style={[styles.statNum, { color: colors.danger }]}>{stats.pdfs}</Text><Text style={styles.statLab}>PDFs</Text></View>
                        <View style={[styles.statBox, { borderColor: '#06b6d4' }]}><Text style={[styles.statNum, { color: '#06b6d4' }]}>{stats.links}</Text><Text style={styles.statLab}>Liens</Text></View>
                    </View>
                </ScrollView>
            )}

            {activeTab === 'sql' && (
                <ScrollView contentContainerStyle={styles.content}>
                    <TextInput style={[styles.sqlInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} placeholder="SELECT * FROM users..." placeholderTextColor={colors.textSec} value={sqlQuery} onChangeText={setSqlQuery} multiline textAlignVertical="top" />
                    <TouchableOpacity style={[styles.sqlBtn, { backgroundColor: colors.primary }]} onPress={executeSQL} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Exécuter</Text>}
                    </TouchableOpacity>
                    {sqlError ? <Text style={{ color: colors.danger, marginTop: 10 }}>{sqlError}</Text> : null}
                    {sqlResult?.data && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ color: colors.success, marginBottom: 8 }}>{sqlResult.rowCount || sqlResult.data.length} résultat(s)</Text>
                            <ScrollView horizontal>
                                <View>
                                    {sqlResult.data.slice(0, 30).map((row, i) => (
                                        <Text key={i} style={{ color: colors.text, fontSize: 11, marginBottom: 4, fontFamily: 'monospace' }}>{JSON.stringify(row)}</Text>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    tabs: { flexDirection: 'row', padding: 8, gap: 4 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    content: { padding: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statBox: { width: '30%', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2 },
    statNum: { fontSize: 32, fontWeight: '800' },
    statLab: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
    sqlInput: { borderWidth: 2, borderRadius: 12, padding: 14, fontSize: 13, fontFamily: 'monospace', minHeight: 100, marginBottom: 10 },
    sqlBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
});