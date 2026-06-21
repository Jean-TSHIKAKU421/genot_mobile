// ==========================================
// admin.tsx
// ==========================================
import { useState, useCallback, useEffect } from 'react';
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
    const [visits, setVisits] = useState(null);

    const colors = { bg: '#020617', card: '#0f172a', text: '#f1f5f9', textSec: '#94a3b8', border: 'rgba(99,102,241,0.2)', inputBg: 'rgba(255,255,255,0.05)', primary: '#6366f1', success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };

    useFocusEffect(useCallback(() => { loadStats(); }, []));

    const loadStats = async () => { try { const r = await fetch(`${API_URL}/admin/stats`); const d = await r.json(); if (d.success && d.stats) setStats(d.stats); } catch (e) { Alert.alert('Erreur', 'Échec de connexion.'); } setReady(true); };
    const loadVisits = async () => { try { const r = await fetch(`${API_URL}/admin/visits`); const d = await r.json(); if (d.success) setVisits(d); } catch (e) {} };
    const executeSQL = async () => { if (!sqlQuery.trim()) return; setLoading(true); setSqlError(''); setSqlResult(null); try { const r = await fetch(`${API_URL}/admin/sql`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: sqlQuery }) }); const d = await r.json(); if (d.success) setSqlResult(d); else setSqlError(d.message); } catch (e) { setSqlError('Erreur de connexion.'); } setLoading(false); };

    if (!ready) return <View style={[styles.container, { backgroundColor: colors.bg }]}><ActivityIndicator color={colors.primary} style={{ marginTop: 100 }} /></View>;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.replace('/')}><Text style={{ color: colors.primary, fontSize: 16 }}>← Sortir</Text></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>🛡️ Admin Panel</Text>
                <TouchableOpacity onPress={loadStats}><FontAwesome5 name="sync" size={16} color={colors.primary} /></TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                {['dashboard', 'visits', 'sql'].map(tab => (
                    <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary }]} onPress={() => { setActiveTab(tab); if (tab === 'visits') loadVisits(); }}>
                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>{tab === 'visits' ? 'Visites' : tab === 'sql' ? 'SQL' : 'Dashboard'}</Text>
                    </TouchableOpacity>
                ))}
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

            {activeTab === 'visits' && visits && (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statBox2, { borderColor: colors.primary }]}><Text style={[styles.statNum, { color: colors.primary }]}>{visits.total}</Text><Text style={styles.statLab}>Total</Text></View>
                        <View style={[styles.statBox2, { borderColor: colors.success }]}><Text style={[styles.statNum, { color: colors.success }]}>{visits.today}</Text><Text style={styles.statLab}>Aujourd'hui</Text></View>
                        <View style={[styles.statBox2, { borderColor: colors.warning }]}><Text style={[styles.statNum, { color: colors.warning }]}>{visits.week}</Text><Text style={styles.statLab}>7 jours</Text></View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>📱 Plateformes</Text>
                    <View style={{ flexDirection: 'row', gap: 14 }}>
                        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 2, borderColor: colors.primary, alignItems: 'center' }}>
                            <FontAwesome5 name="globe" size={32} color={colors.primary} />
                            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 10 }}>Web</Text>
                            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 36, marginTop: 8 }}>{visits.platforms?.find(p => p.platform === 'web')?.count || 0}</Text>
                            <Text style={{ color: colors.textSec, fontSize: 12, marginTop: 4 }}>visites</Text>
                            <View style={{ width: '100%', height: 8, backgroundColor: colors.border, borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
                                <View style={{ width: `${visits.total > 0 ? ((visits.platforms?.find(p => p.platform === 'web')?.count || 0) / visits.total) * 100 : 0}%`, height: '100%', backgroundColor: colors.primary, borderRadius: 4 }} />
                            </View>
                            <Text style={{ color: colors.textSec, fontSize: 11, marginTop: 6 }}>{visits.total > 0 ? Math.round(((visits.platforms?.find(p => p.platform === 'web')?.count || 0) / visits.total) * 100) : 0}%</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 2, borderColor: colors.success, alignItems: 'center' }}>
                            <FontAwesome5 name="mobile-alt" size={38} color={colors.success} />
                            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 10 }}>Mobile</Text>
                            <Text style={{ color: colors.success, fontWeight: '800', fontSize: 36, marginTop: 8 }}>{visits.platforms?.find(p => p.platform === 'mobile')?.count || 0}</Text>
                            <Text style={{ color: colors.textSec, fontSize: 12, marginTop: 4 }}>visites</Text>
                            <View style={{ width: '100%', height: 8, backgroundColor: colors.border, borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
                                <View style={{ width: `${visits.total > 0 ? ((visits.platforms?.find(p => p.platform === 'mobile')?.count || 0) / visits.total) * 100 : 0}%`, height: '100%', backgroundColor: colors.success, borderRadius: 4 }} />
                            </View>
                            <Text style={{ color: colors.textSec, fontSize: 11, marginTop: 6 }}>{visits.total > 0 ? Math.round(((visits.platforms?.find(p => p.platform === 'mobile')?.count || 0) / visits.total) * 100) : 0}%</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>📅 30 derniers jours</Text>
                    <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', gap: 4, paddingVertical: 12 }}>
                                {visits.daily?.map((d, i) => {
                                    const maxCount = Math.max(...(visits.daily?.map(x => x.count) || [1]));
                                    const height = maxCount > 0 ? (d.count / maxCount) * 120 : 4;
                                    const displayDate = d.date ? new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '';
                                    return (
                                        <View key={i} style={{ alignItems: 'center', minWidth: 36 }}>
                                            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12, marginBottom: 4 }}>{d.count}</Text>
                                            <View style={{ width: 28, height: Math.max(height, 4), backgroundColor: colors.primary, borderRadius: 6, opacity: height > 10 ? 1 : 0.5 }} />
                                            <Text style={{ color: colors.textSec, fontSize: 9, marginTop: 6, transform: [{ rotate: '-45deg' }], width: 40, textAlign: 'right' }}>{displayDate}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
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
                            <ScrollView horizontal><View>{sqlResult.data.slice(0, 30).map((row, i) => (<Text key={i} style={{ color: colors.text, fontSize: 11, marginBottom: 4, fontFamily: 'monospace' }}>{JSON.stringify(row)}</Text>))}</View></ScrollView>
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
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    statBox: { width: '30%', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2 },
    statBox2: { flex: 1, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2 },
    statNum: { fontSize: 28, fontWeight: '800' },
    statLab: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
    calendarCard: { borderRadius: 20, padding: 12, borderWidth: 1, marginBottom: 16 },
    sqlInput: { borderWidth: 2, borderRadius: 12, padding: 14, fontSize: 13, fontFamily: 'monospace', minHeight: 100, marginBottom: 10 },
    sqlBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
});