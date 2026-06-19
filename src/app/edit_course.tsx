import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'https://jtt.alwaysdata.net/api';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dfosclwrp/image/upload';
const UPLOAD_PRESET = 'genotApp';

export default function EditCourseScreen() {
    const { id } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [professor, setProfessor] = useState('');
    const [description, setDescription] = useState('');
    const [currentImage, setCurrentImage] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('dark');

    useEffect(() => { AsyncStorage.getItem('theme').then(t => { if (t) setTheme(t); }); loadUser(); loadCourse(); }, [id]);
    const loadUser = async () => { const u = await AsyncStorage.getItem('currentUser'); if (!u) { router.replace('/'); return; } setUser(JSON.parse(u)); };

    const isDark = theme === 'dark';
    const colors = { bg: isDark ? '#020617' : '#f0f2f5', card: isDark ? '#0f172a' : '#ffffff', text: isDark ? '#f1f5f9' : '#1a1a2e', textSec: isDark ? '#94a3b8' : '#64748b', border: isDark ? 'rgba(99,102,241,0.2)' : '#e2e8f0', inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', primary: '#6366f1', danger: '#ef4444', success: '#10b981' };

    const loadCourse = async () => { try { const r = await fetch(`${API_URL}/course/${id}`); const d = await r.json(); if (d.success) { setTitle(d.course.title); setProfessor(d.course.professor || ''); setDescription(d.course.description || ''); setCurrentImage(d.course.image_url || ''); } } catch (e) {} };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission', "Autorisez l'accès à la galerie."); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.8 });
        if (!result.canceled) setNewImage(result.assets[0]);
    };

    const handleSave = async () => {
        if (!title.trim()) { setMessage('Le titre est requis.'); setMessageType('error'); return; }
        setLoading(true); setMessage('');
        try {
            let imageUrl = currentImage;
            if (newImage) {
                const cfd = new FormData();
                cfd.append('file', { uri: newImage.uri, type: 'image/jpeg', name: 'upload.jpg' } as any);
                cfd.append('upload_preset', UPLOAD_PRESET);
                const cr = await fetch(CLOUDINARY_URL, { method: 'POST', body: cfd });
                const cd = await cr.json();
                if (cd.secure_url) imageUrl = cd.secure_url;
                else { setMessage('Erreur upload image.'); setMessageType('error'); setLoading(false); return; }
            }
            const fd = new FormData();
            fd.append('title', title.trim());
            if (professor.trim()) fd.append('professor', professor.trim());
            if (description.trim()) fd.append('description', description.trim());
            if (imageUrl) fd.append('image_url', imageUrl);
            const r = await fetch(`${API_URL}/courses/${id}`, { method: 'PUT', body: fd });
            const d = await r.json();
            if (d.success) { setMessage('✅ Cours modifié !'); setMessageType('success'); setTimeout(() => router.back(), 800); }
            else { setMessage(d.message || 'Erreur.'); setMessageType('error'); }
        } catch (e) { setMessage('Erreur: ' + e.message); setMessageType('error'); }
        setLoading(false);
    };

    if (!user) return <View style={[styles.container, { backgroundColor: colors.bg }]}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>Chargement...</Text></View>;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}><FontAwesome5 name="arrow-left" size={18} color={colors.primary} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Modifier le cours</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, { backgroundColor: colors.inputBg, borderColor: colors.border }]} activeOpacity={0.7}>
                    {newImage ? (
                        <View style={styles.imagePreviewContainer}><Image source={{ uri: newImage.uri }} style={styles.previewImage} /><TouchableOpacity style={styles.removeImageBtn} onPress={() => setNewImage(null)}><FontAwesome5 name="times-circle" size={24} color={colors.danger} /></TouchableOpacity></View>
                    ) : currentImage ? (
                        <View style={styles.imagePreviewContainer}><Image source={{ uri: currentImage }} style={styles.previewImage} /><TouchableOpacity style={styles.removeImageBtn} onPress={() => { setCurrentImage(''); setNewImage(null); }}><FontAwesome5 name="times-circle" size={24} color={colors.danger} /></TouchableOpacity></View>
                    ) : (
                        <View style={styles.imagePlaceholder}><FontAwesome5 name="image" size={40} color={colors.textSec} /><Text style={[styles.imagePickerText, { color: colors.textSec }]}>Ajouter une image de couverture</Text></View>
                    )}
                </TouchableOpacity>

                <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Titre du cours <Text style={{ color: '#ef4444' }}>*</Text></Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}><FontAwesome5 name="book" size={14} color={colors.textSec} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} placeholder="Titre du cours" placeholderTextColor={colors.textSec} value={title} onChangeText={setTitle} maxLength={100} /></View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Professeur <Text style={{ color: '#64748b', fontSize: 11 }}>(optionnel)</Text></Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}><FontAwesome5 name="user-tie" size={14} color={colors.textSec} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} placeholder="Nom du professeur" placeholderTextColor={colors.textSec} value={professor} onChangeText={setProfessor} /></View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Description <Text style={{ color: '#64748b', fontSize: 11 }}>(optionnel)</Text></Text>
                        <View style={[styles.textareaWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}><TextInput style={[styles.textarea, { color: colors.text }]} placeholder="Description du cours..." placeholderTextColor={colors.textSec} value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" maxLength={500} /></View>
                        <Text style={[styles.charCount, { color: colors.textSec }]}>{description.length}/500</Text>
                    </View>
                </View>

                {message ? <View style={[styles.messageBox, messageType === 'error' ? styles.messageError : styles.messageSuccess]}><Text style={[styles.messageText, { color: messageType === 'error' ? '#fca5a5' : '#6ee7b7' }]}>{message}</Text></View> : null}

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
                    {loading ? <ActivityIndicator color="#fff" /> : <View style={styles.submitBtnContent}><FontAwesome5 name="save" size={16} color="#fff" /><Text style={styles.submitBtnText}> Enregistrer</Text></View>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => router.back()}><Text style={[styles.cancelBtnText, { color: colors.textSec }]}>Annuler</Text></TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1 },
    headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 16, paddingBottom: 40 },
    imagePicker: { height: 200, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', marginBottom: 20, overflow: 'hidden' },
    imagePreviewContainer: { width: '100%', height: '100%', position: 'relative' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    removeImageBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 },
    imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    imagePickerText: { fontSize: 14, fontWeight: '600', marginTop: 10 },
    formCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 20 },
    formGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12, overflow: 'hidden' },
    inputIcon: { paddingLeft: 14, width: 36 },
    input: { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: 15 },
    textareaWrapper: { borderWidth: 2, borderRadius: 12, overflow: 'hidden' },
    textarea: { padding: 14, fontSize: 15, minHeight: 100, lineHeight: 22 },
    charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
    messageBox: { padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
    messageError: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' },
    messageSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' },
    messageText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
    submitBtn: { borderRadius: 50, padding: 16, alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    submitBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    cancelBtn: { borderRadius: 50, padding: 14, alignItems: 'center', marginTop: 12, borderWidth: 1 },
    cancelBtnText: { fontSize: 14, fontWeight: '600' },
});