import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput, Image, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function CourseScreen() {
    const { id } = useLocalSearchParams();
    const [course, setCourse] = useState(null);
    const [notes, setNotes] = useState([]);
    const [currentTab, setCurrentTab] = useState('supports');
    const [searchTerm, setSearchTerm] = useState('');
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [addType, setAddType] = useState('');
    const [pdfTitle, setPdfTitle] = useState('');
    const [pdfAuthor, setPdfAuthor] = useState('');
    const [linkTitle, setLinkTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [notebookVisible, setNotebookVisible] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [editNoteVisible, setEditNoteVisible] = useState(false);
    const [editNoteId, setEditNoteId] = useState(null);
    const [editNoteTitle, setEditNoteTitle] = useState('');
    const [editNoteContent, setEditNoteContent] = useState('');
    const [theme, setTheme] = useState('dark');

    useEffect(() => { AsyncStorage.getItem('theme').then(t => { if (t) setTheme(t); }); }, []);

    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? '#020617' : '#f0f2f5', card: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1a1a2e', textSec: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(99,102,241,0.2)' : '#e2e8f0', inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        primary: '#6366f1', danger: '#ef4444', success: '#10b981', warning: '#f59e0b',
    };

    useFocusEffect(useCallback(() => { loadCourse(); }, [id]));

    const loadCourse = async () => {
        try {
            const r = await fetch(`${API_URL}/course/${id}`);
            const d = await r.json();
            if (d.success) { setCourse(d.course); setNotes(d.notes); }
        } catch (e) {}
    };

    const deleteItem = (noteId: number) => {
        Alert.alert('Supprimer', 'Mettre dans la corbeille ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', onPress: async () => {
                await fetch(`${API_URL}/notes/${noteId}`, { method: 'DELETE' });
                loadCourse();
            }},
        ]);
    };

    const shareItem = async (title: string, url?: string) => {
        try {
            await Sharing.shareAsync(url || '', { dialogTitle: title });
        } catch (e) {
            Alert.alert('Partage', url || 'Aucun lien à partager');
        }
    };

    const downloadFile = (fileUrl: string) => {
        if (fileUrl) {
            const fullUrl = `${API_URL.replace('/api', '')}${fileUrl}`;
            Alert.alert('Téléchargement', fullUrl);
        }
    };

    const openEditNote = (note: any) => {
        setEditNoteId(note.id);
        setEditNoteTitle(note.title);
        setEditNoteContent(note.content || '');
        setEditNoteVisible(true);
    };

    const saveEditedNote = async () => {
        if (!editNoteTitle || !editNoteContent) { Alert.alert('Erreur', 'Titre et contenu requis.'); return; }
        await fetch(`${API_URL}/notes/${editNoteId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editNoteTitle, content: editNoteContent })
        });
        setEditNoteVisible(false);
        loadCourse();
    };

    // Filtrage par recherche
    const supports = notes.filter(n => n.type === 'support' && (
        !searchTerm || (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    ));
    const links = notes.filter(n => n.type === 'link' && (
        !searchTerm || (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    ));
    const notesList = notes.filter(n => n.type === 'note' && (
        !searchTerm || (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    ));

    const renderSupport = ({ item }) => (
        <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={() => item.file_url ? Alert.alert('PDF', `${API_URL.replace('/api','')}${item.file_url}`) : null}>
                <View style={[styles.itemIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}><Text style={{ fontSize: 20 }}>📄</Text></View>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: colors.textSec }]}>{item.content || 'Auteur inconnu'}</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.itemBtn}><Text>🗑️</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => shareItem(item.title, item.file_url)} style={styles.itemBtn}><Text>🔗</Text></TouchableOpacity>
                {item.file_url && <TouchableOpacity onPress={() => downloadFile(item.file_url)} style={styles.itemBtn}><Text>⬇️</Text></TouchableOpacity>}
            </View>
        </View>
    );

    const renderLink = ({ item }) => (
        <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.itemIcon, { backgroundColor: 'rgba(6,182,212,0.1)' }]}><Text style={{ fontSize: 20 }}>🔗</Text></View>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: colors.primary }]} numberOfLines={1}>{item.content || '#'}</Text>
                </View>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.itemBtn}><Text>🗑️</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => shareItem(item.title, item.content)} style={styles.itemBtn}><Text>🔗</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert('Ouvrir', item.content)} style={styles.itemBtn}><Text>🌐</Text></TouchableOpacity>
            </View>
        </View>
    );

    const renderNote = ({ item }) => (
        <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftWidth: 3, borderLeftColor: colors.primary }]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.itemIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}><Text style={{ fontSize: 20 }}>📝</Text></View>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: colors.textSec }]} numberOfLines={2}>{item.content?.replace(/<[^>]*>/g, '').substring(0, 80) || 'Note vide'}</Text>
                </View>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => openEditNote(item)} style={styles.itemBtn}><Text>✏️</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.itemBtn}><Text>🗑️</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => shareItem(item.title)} style={styles.itemBtn}><Text>🔗</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    const text = `Titre: ${item.title}\nDate: ${new Date(item.created_at).toLocaleString('fr-FR')}\n\n${item.content?.replace(/<[^>]*>/g, '') || ''}`;
                    Alert.alert('Note', text.substring(0, 200) + '...');
                }} style={styles.itemBtn}><Text>👁️</Text></TouchableOpacity>
            </View>
        </View>
    );

    if (!course) return <View style={[styles.container, { backgroundColor: colors.bg }]}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>Chargement...</Text></View>;

    const tabs = [
        { key: 'supports', label: '📄 Supports', data: supports, render: renderSupport },
        { key: 'links', label: '🔗 Liens', data: links, render: renderLink },
        { key: 'notes', label: '📝 Notes', data: notesList, render: renderNote },
    ];
    const activeTab = tabs.find(t => t.key === currentTab) || tabs[0];

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}><Text style={{ color: colors.primary, fontSize: 16 }}>← Retour</Text></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{course.title}</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(true)}><Text style={{ color: colors.primary, fontSize: 24 }}>+</Text></TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Rechercher..." placeholderTextColor={colors.textSec} value={searchTerm} onChangeText={setSearchTerm} />
                {searchTerm.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchTerm('')}>
                        <Text style={{ color: colors.textSec, fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.tabs}>
                {tabs.map(tab => (
                    <TouchableOpacity key={tab.key} style={[styles.tab, currentTab === tab.key && { backgroundColor: colors.primary + '20' }]} onPress={() => setCurrentTab(tab.key)}>
                        <Text style={[styles.tabText, { color: currentTab === tab.key ? colors.primary : colors.textSec }]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList data={activeTab.data} renderItem={activeTab.render} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.list}
                ListEmptyComponent={<View style={styles.empty}><Text style={{ fontSize: 40 }}>📭</Text><Text style={{ color: colors.textSec }}>Aucun élément</Text></View>}
            />

            {/* Modal Ajouter */}
            <Modal visible={addModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Ajouter un élément</Text>
                        <View style={styles.typeSelector}>
                            {['pdf', 'link', 'note'].map(type => (
                                <TouchableOpacity key={type} style={[styles.typeBtn, addType === type && { backgroundColor: colors.primary + '30', borderColor: colors.primary }]} onPress={() => setAddType(type)}>
                                    <Text style={{ color: addType === type ? colors.primary : colors.textSec, fontSize: 13, textAlign: 'center' }}>{type === 'pdf' ? '📄 PDF' : type === 'link' ? '🔗 Lien' : '📝 Note'}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {addType === 'pdf' && (
                            <>
                                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} placeholder="Titre du PDF" placeholderTextColor={colors.textSec} value={pdfTitle} onChangeText={setPdfTitle} />
                                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} placeholder="Auteur" placeholderTextColor={colors.textSec} value={pdfAuthor} onChangeText={setPdfAuthor} />
                                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={async () => {
                                    if (!pdfTitle || !pdfAuthor) { Alert.alert('Erreur', 'Tous les champs requis.'); return; }
                                    const u = await AsyncStorage.getItem('currentUser');
                                    const user = JSON.parse(u || '{}');
                                    const fd = new FormData();
                                    fd.append('course_id', id as string);
                                    fd.append('title', pdfTitle);
                                    fd.append('content', pdfAuthor);
                                    fd.append('type', 'support');
                                    fd.append('user_matricule', user.matricule);
                                    await fetch(`${API_URL}/notes`, { method: 'POST', body: fd });
                                    setAddModalVisible(false); setAddType(''); setPdfTitle(''); setPdfAuthor('');
                                    loadCourse();
                                }}><Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Ajouter PDF</Text></TouchableOpacity>
                            </>
                        )}

                        {addType === 'link' && (
                            <>
                                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} placeholder="Titre" placeholderTextColor={colors.textSec} value={linkTitle} onChangeText={setLinkTitle} />
                                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} placeholder="URL" placeholderTextColor={colors.textSec} value={linkUrl} onChangeText={setLinkUrl} />
                                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={async () => {
                                    if (!linkTitle || !linkUrl) { Alert.alert('Erreur', 'Tous les champs requis.'); return; }
                                    await fetch(`${API_URL}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course_id: id, title: linkTitle, content: linkUrl, type: 'link' }) });
                                    setAddModalVisible(false); setAddType(''); setLinkTitle(''); setLinkUrl('');
                                    loadCourse();
                                }}><Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Ajouter Lien</Text></TouchableOpacity>
                            </>
                        )}

                        {addType === 'note' && (
                            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => { setAddModalVisible(false); setNotebookVisible(true); }}>
                                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>📝 Ouvrir le cahier</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={() => { setAddModalVisible(false); setAddType(''); }}><Text style={{ color: colors.textSec, textAlign: 'center', marginTop: 12 }}>Annuler</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal Cahier de notes */}
            <Modal visible={notebookVisible} transparent animationType="slide">
                <View style={[styles.notebookContainer, { backgroundColor: colors.bg }]}>
                    <View style={[styles.notebookHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => { setNotebookVisible(false); setNoteTitle(''); setNoteContent(''); }}><Text style={{ color: colors.danger }}>Annuler</Text></TouchableOpacity>
                        <Text style={{ color: colors.text, fontWeight: '700' }}>📝 Nouvelle note</Text>
                        <TouchableOpacity onPress={async () => {
                            if (!noteTitle || !noteContent) { Alert.alert('Erreur', 'Titre et contenu requis.'); return; }
                            await fetch(`${API_URL}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course_id: id, title: noteTitle, content: noteContent, type: 'note' }) });
                            setNotebookVisible(false); setNoteTitle(''); setNoteContent('');
                            loadCourse();
                        }}><Text style={{ color: colors.primary, fontWeight: '700' }}>Enregistrer</Text></TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1, padding: 16 }}>
                        <TextInput style={[styles.noteTitleInput, { color: colors.text, borderBottomColor: colors.border }]} placeholder="Titre de la note" placeholderTextColor={colors.textSec} value={noteTitle} onChangeText={setNoteTitle} />
                        <TextInput style={[styles.noteContentInput, { color: colors.text }]} placeholder="Commencez à écrire..." placeholderTextColor={colors.textSec} value={noteContent} onChangeText={setNoteContent} multiline textAlignVertical="top" />
                    </ScrollView>
                </View>
            </Modal>

            {/* Modal Modifier note */}
            <Modal visible={editNoteVisible} transparent animationType="slide">
                <View style={[styles.notebookContainer, { backgroundColor: colors.bg }]}>
                    <View style={[styles.notebookHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => setEditNoteVisible(false)}><Text style={{ color: colors.danger }}>Annuler</Text></TouchableOpacity>
                        <Text style={{ color: colors.text, fontWeight: '700' }}>✏️ Modifier</Text>
                        <TouchableOpacity onPress={saveEditedNote}><Text style={{ color: colors.primary, fontWeight: '700' }}>Enregistrer</Text></TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1, padding: 16 }}>
                        <TextInput style={[styles.noteTitleInput, { color: colors.text, borderBottomColor: colors.border }]} placeholder="Titre" placeholderTextColor={colors.textSec} value={editNoteTitle} onChangeText={setEditNoteTitle} />
                        <TextInput style={[styles.noteContentInput, { color: colors.text }]} placeholder="Contenu..." placeholderTextColor={colors.textSec} value={editNoteContent} onChangeText={setEditNoteContent} multiline textAlignVertical="top" />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 8 },
    searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 14, borderRadius: 50, borderWidth: 1, height: 44 },
    searchInput: { flex: 1, fontSize: 14 },
    tabs: { flexDirection: 'row', paddingHorizontal: 12, gap: 4, marginBottom: 4 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 50, alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: '600' },
    list: { padding: 12 },
    itemCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, marginBottom: 8, borderWidth: 1 },
    itemIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    itemInfo: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: '600' },
    itemSubtitle: { fontSize: 11, marginTop: 2 },
    itemActions: { flexDirection: 'row', gap: 2 },
    itemBtn: { padding: 6 },
    empty: { alignItems: 'center', padding: 40 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalCard: { borderRadius: 20, padding: 24, borderWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
    typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    input: { borderWidth: 2, borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 10 },
    btn: { padding: 14, borderRadius: 12, marginTop: 4 },
    notebookContainer: { flex: 1, paddingTop: 50 },
    notebookHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    noteTitleInput: { fontSize: 18, fontWeight: '700', paddingVertical: 12, borderBottomWidth: 2, marginBottom: 16 },
    noteContentInput: { flex: 1, fontSize: 15, lineHeight: 26, minHeight: 200 },
});