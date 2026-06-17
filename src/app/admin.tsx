import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, FlatList, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function AdminScreen() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [sqlQuery, setSqlQuery] = useState('');
    const [sqlResult, setSqlResult] = useState(null);
    const [sqlError, setSqlError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    const colors = {
        bg: '#020617', card: '#0f172a', text: '#f1f5f9', textSec: '#94a3b8',
        border: 'rgba(99,102,241,0.2)', inputBg: 'rgba(255,255,255,0.05)',
        primary: '#6366f1', success: '#10b981', danger: '#ef4444', warning: '#f59e0b',
    };

    useFocusEffect(useCallback(() => { loadStats(); }, []));

    const loadStats = async () => {
        try {
            const r = await fetch(`${API_URL}/admin/stats`);
            const d = await r.json();
            if (d.success) { setStats(d.stats); setUsers(d.usersList); }
        } catch (e) {}
    };

    const executeSQL = async () => {
        if (!sqlQuery.trim()) return;
        setLoading(true); setSqlError(''); setSqlResult(null);
        try {
            const r = await fetch(`${API_URL}/admin/sql`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: sqlQuery })
            });
            const d = await r.json();
            if (d.success) { setSqlResult(d); } else { setSqlError(d.message); }
        } catch (e) { setSqlError('Erreur de connexion.'); }
        setLoading(false);
    };

    const deleteUser = (matricule) => {
        Alert.alert('⚠️ Supprimer', `Supprimer ${matricule} et toutes ses données ?`, [
            { text: 'Annuler' },
            { text: 'Supprimer', style: 'destructive', onPress: async () => {
                await fetch(`${API_URL}/admin/user/${matricule}`, { method: 'DELETE' });
                loadStats();
            }},
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}><Text style={{ color: colors.primary }}>←</Text></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>🛡️ Admin Panel</Text>
                <TouchableOpacity onPress={() => router.replace('/')}><Text style={{ color: colors.danger }}>Exit</Text></TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {['dashboard', 'users', 'sql'].map(tab => (
                    <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary }]} onPress={() => setActiveTab(tab)}>
                        <Text style={{ color: '#fff', fontWeight: '600', textTransform: 'capitalize' }}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'dashboard' && stats && (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.statsGrid}>
                        <StatCard icon="users" value={stats.users} label="Utilisateurs" color={colors.primary} />
                        <StatCard icon="book" value={stats.courses} label="Cours" color={colors.success} />
                        <StatCard icon="sticky-note" value={stats.notes} label="Notes" color={colors.warning} />
                        <StatCard icon="file-pdf" value={stats.pdfs} label="PDFs" color={colors.danger} />
                        <StatCard icon="link" value={stats.links} label="Liens" color="#06b6d4" />
                    </View>
                </ScrollView>
            )}

            {activeTab === 'users' && (
                <FlatList
                    data={users}
                    keyExtractor={item => item.matricule}
                    contentContainerStyle={styles.content}
                    renderItem={({ item }) => (
                        <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.text, fontWeight: '600' }}>{item.nom}</Text>
                                <Text style={{ color: colors.textSec, fontSize: 12 }}>{item.matricule} • {item.email || 'Pas d\'email'}</Text>
                                <Text style={{ color: colors.textSec, fontSize: 11 }}>Depuis {new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
                            </View>
                            <TouchableOpacity onPress={() => deleteUser(item.matricule)} style={{ padding: 8 }}>
                                <FontAwesome5 name="trash" size={16} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {activeTab === 'sql' && (
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={{ color: colors.warning, fontSize: 12, marginBottom: 8 }}>⚠️ DROP, ALTER, TRUNCATE désactivés</Text>
                    <TextInput
                        style={[styles.sqlInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                        placeholder="SELECT * FROM users..."
                        placeholderTextColor={colors.textSec}
                        value={sqlQuery}
                        onChangeText={setSqlQuery}
                        multiline
                        textAlignVertical="top"
                    />
                    <TouchableOpacity style={[styles.sqlBtn, { backgroundColor: colors.primary }]} onPress={executeSQL} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Exécuter</Text>}
                    </TouchableOpacity>
                    
                    {sqlError ? <Text style={{ color: colors.danger, marginTop: 10 }}>{sqlError}</Text> : null}
                    
                    {sqlResult && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ color: colors.success, marginBottom: 8 }}>{sqlResult.rowCount} résultat(s)</Text>
                            <ScrollView horizontal>
                                <View>
                                    {sqlResult.data.slice(0, 50).map((row, i) => (
                                        <View key={i} style={{ flexDirection: 'row', padding: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                            {Object.values(row).map((val, j) => (
                                                <Text key={j} style={{ color: colors.text, fontSize: 11, marginRight: 12, maxWidth: 200 }} numberOfLines={1}>{String(val)}</Text>
                                            ))}
                                        </View>
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

const StatCard = ({ icon, value, label, color }) => (
    <View style={[statStyles.card, { borderColor: color }]}>
        <FontAwesome5 name={icon} size={24} color={color} />
        <Text style={[statStyles.value, { color }]}>{value}</Text>
        <Text style={statStyles.label}>{label}</Text>
    </View>
);

const statStyles = StyleSheet.create({
    card: { width: '30%', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, marginBottom: 10 },
    value: { fontSize: 28, fontWeight: '800', marginTop: 8 },
    label: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    tabs: { flexDirection: 'row', padding: 8, gap: 4 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    content: { padding: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: '5%' },
    userCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
    sqlInput: { borderWidth: 2, borderRadius: 12, padding: 14, fontSize: 13, fontFamily: 'monospace', minHeight: 120, marginBottom: 10 },
    sqlBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
});