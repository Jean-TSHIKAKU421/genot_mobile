// ==========================================
// vault.tsx
// ==========================================
import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
const API_URL = 'https://jtt.alwaysdata.net/api';

export default function VaultScreen() {
    const [u, su] = useState(null); const [locked, slocked] = useState(true); const [pass, spass] = useState('');
    const [courses, scourses] = useState([]); const [notes, snotes] = useState([]); const [tab, stab] = useState('courses');
    const [th, sth] = useState('dark');
    const dk = th === 'dark'; const cl = { bg: dk ? '#020617' : '#f0f2f5', cd: dk ? '#0f172a' : '#ffffff', tx: dk ? '#f1f5f9' : '#1a1a2e', ts: dk ? '#94a3b8' : '#64748b', bd: dk ? 'rgba(99,102,241,0.2)' : '#e2e8f0', ib: dk ? 'rgba(255,255,255,0.05)' : '#f8fafc', pr: '#6366f1', dg: '#ef4444', sc: '#10b981', wn: '#f59e0b' };
    useFocusEffect(useCallback(() => { (async () => { const uu = await AsyncStorage.getItem('currentUser'); if (!uu) { router.replace('/'); return; } su(JSON.parse(uu)); })(); }, []));

    const unlock = async () => { if (!pass.trim()) { Alert.alert('Erreur', 'Veuillez entrer le mot de passe.'); return; } const r = await fetch(`${API_URL}/vault/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matricule: u.matricule, password: pass }) }); const d = await r.json(); if (d.success) { slocked(false); loadVault(); } else Alert.alert('Erreur', d.message); };
    const loadVault = async () => { const r = await fetch(`${API_URL}/vault/${u.matricule}`); const d = await r.json(); if (d.success) { scourses(d.courses); snotes(d.notes); } };
    const restoreItem = async (type, id) => { Alert.alert('Restaurer', 'Remettre cet élément visible ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Oui', onPress: async () => { await fetch(`${API_URL}/toggle-visibility/${type}/${id}`, { method: 'POST' }); loadVault(); } }]) };
    const deleteItem = async (type, id) => { Alert.alert('Supprimer', 'Mettre dans la corbeille ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Oui', onPress: async () => { if (type === 'course') { await fetch(`${API_URL}/courses/${id}`, { method: 'DELETE' }); } else { await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' }); } loadVault(); } }]) };

    if (locked) {
        return (
            <View style={[ss.ct, { backgroundColor: cl.bg, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                <FontAwesome5 name="vault" size={60} color={cl.pr} style={{ marginBottom: 20 }} />
                <Text style={{ color: cl.tx, fontSize: 22, fontWeight: '700', marginBottom: 8 }}>Coffre-fort</Text>
                <Text style={{ color: cl.ts, fontSize: 14, marginBottom: 24, textAlign: 'center' }}>Entrez votre mot de passe pour accéder au coffre-fort</Text>
                <View style={[ss.pw, { backgroundColor: cl.ib, borderColor: cl.bd }]}>
                    <FontAwesome5 name="lock" size={16} color={cl.ts} style={{ marginRight: 10 }} />
                    <TextInput style={{ flex: 1, color: cl.tx, fontSize: 15 }} placeholder="Mot de passe" placeholderTextColor={cl.ts} value={pass} onChangeText={spass} secureTextEntry onSubmitEditing={unlock} />
                </View>
                <TouchableOpacity style={[ss.btn, { backgroundColor: cl.pr }]} onPress={unlock}><FontAwesome5 name="unlock" size={16} color="#fff" /><Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>Déverrouiller</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}><Text style={{ color: cl.ts, fontSize: 14 }}>← Retour</Text></TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[ss.ct, { backgroundColor: cl.bg }]}>
            <View style={[ss.hd, { backgroundColor: cl.cd, borderBottomColor: cl.bd }]}>
                <TouchableOpacity onPress={() => router.back()} style={ss.hb}><FontAwesome5 name="arrow-left" size={18} color={cl.pr} /></TouchableOpacity>
                <Text style={[ss.ht, { color: cl.tx }]}>🔒 Coffre-fort</Text>
                <View style={ss.hb} />
            </View>
            <View style={ss.tabs}>
                <TouchableOpacity style={[ss.tab, tab === 'courses' && { backgroundColor: cl.pr }]} onPress={() => stab('courses')}><Text style={[ss.tt, { color: tab === 'courses' ? '#fff' : cl.ts }]}>📚 Cours ({courses.length})</Text></TouchableOpacity>
                <TouchableOpacity style={[ss.tab, tab === 'data' && { backgroundColor: cl.pr }]} onPress={() => stab('data')}><Text style={[ss.tt, { color: tab === 'data' ? '#fff' : cl.ts }]}>📄 Données ({notes.length})</Text></TouchableOpacity>
            </View>
            {tab === 'courses' && (
                <FlatList data={courses} keyExtractor={item => 'c' + item.id} contentContainerStyle={ss.ls} renderItem={({ item }) => (
                    <View style={[ss.item, { backgroundColor: cl.cd, borderColor: cl.bd }]}>
                        <View style={{ flex: 1 }}><Text style={[ss.it2, { color: cl.tx }]} numberOfLines={1}>📚 {item.title}</Text><Text style={[ss.is2, { color: cl.ts }]}>{item.professor ? 'Prof: ' + item.professor + ' • ' : ''}{new Date(item.created_at).toLocaleDateString('fr-FR')}</Text></View>
                        <View style={ss.ia2}>
                            <TouchableOpacity style={[ss.ib2, { backgroundColor: cl.sc }]} onPress={() => restoreItem('course', item.id)}><FontAwesome5 name="undo" size={12} color="#fff" /></TouchableOpacity>
                            <TouchableOpacity style={[ss.ib2, { backgroundColor: cl.dg }]} onPress={() => deleteItem('course', item.id)}><FontAwesome5 name="trash-alt" size={12} color="#fff" /></TouchableOpacity>
                        </View>
                    </View>
                )} ListEmptyComponent={<View style={ss.em}><Text style={{ color: cl.ts }}>Aucun cours masqué</Text></View>} />
            )}
            {tab === 'data' && (
                <FlatList data={notes} keyExtractor={item => 'n' + item.id} contentContainerStyle={ss.ls} renderItem={({ item }) => (
                    <View style={[ss.item, { backgroundColor: cl.cd, borderColor: cl.bd }]}>
                        <View style={{ flex: 1 }}><Text style={[ss.it2, { color: cl.tx }]} numberOfLines={1}>{item.type === 'support' ? '📄' : item.type === 'link' ? '🔗' : '📝'} {item.title}</Text><Text style={[ss.is2, { color: cl.ts }]}>Cours: {item.course_title || 'Inconnu'}</Text></View>
                        <View style={ss.ia2}>
                            <TouchableOpacity style={[ss.ib2, { backgroundColor: cl.sc }]} onPress={() => restoreItem('note', item.id)}><FontAwesome5 name="undo" size={12} color="#fff" /></TouchableOpacity>
                            <TouchableOpacity style={[ss.ib2, { backgroundColor: cl.dg }]} onPress={() => deleteItem('note', item.id)}><FontAwesome5 name="trash-alt" size={12} color="#fff" /></TouchableOpacity>
                        </View>
                    </View>
                )} ListEmptyComponent={<View style={ss.em}><Text style={{ color: cl.ts }}>Aucune donnée masquée</Text></View>} />
            )}
        </View>
    );
}

const ss = StyleSheet.create({
    ct: { flex: 1 }, hd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1 },
    hb: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }, ht: { fontSize: 18, fontWeight: '700' },
    pw: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 14, borderRadius: 14, borderWidth: 2, marginBottom: 16 }, btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, width: '100%' },
    tabs: { flexDirection: 'row', padding: 8, gap: 4 }, tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }, tt: { fontSize: 13, fontWeight: '600' },
    ls: { padding: 12 }, item: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginBottom: 8, borderWidth: 1 },
    it2: { fontSize: 14, fontWeight: '600' }, is2: { fontSize: 11, marginTop: 4 }, ia2: { flexDirection: 'row', gap: 6 }, ib2: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    em: { alignItems: 'center', padding: 40 },
});