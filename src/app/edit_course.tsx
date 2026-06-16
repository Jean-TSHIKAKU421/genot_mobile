import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Image, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'https://jtt.alwaysdata.net/api';

export default function EditCourseScreen() {
    const { id } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [professor, setProfessor] = useState('');
    const [description, setDescription] = useState('');
    const [currentImage, setCurrentImage] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState('dark');

    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? '#020617' : '#f0f2f5', card: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1a1a2e', textSec: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(99,102,241,0.2)' : '#e2e8f0', inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        primary: '#6366f1', danger: '#ef4444',
    };

    useEffect(() => { loadCourse(); }, [id]);

    const loadCourse = async () => {
        try {
            const r = await fetch(`${API_URL}/course/${id}`);
            const d = await r.json();
            if (d.success) {
                setTitle(d.course.title);
                setProfessor(d.course.professor || '');
                setDescription(d.course.description || '');
                setCurrentImage(d.course.image_url || '');
            }
        } catch (e) {}
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.7 });
        if (!result.canceled) setNewImage(result.assets[0]);
    };

    const handleSave = async () => {
        if (!title) { Alert.alert('Erreur', 'Le titre est requis.'); return; }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('professor', professor);
            formData.append('description', description);
            if (newImage) formData.append('image', { uri: newImage.uri, type: 'image/jpeg', name: 'course.jpg' } as any);
            
            const r = await fetch(`${API_URL}/courses/${id}`, { method: 'PUT', body: formData });
            const d = await r.json();
            if (d.success) { router.back(); } else { Alert.alert('Erreur', d.message); }
        } catch (e) { Alert.alert('Erreur', 'Impossible de modifier.'); }
        setLoading(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}><Text style={{ color: colors.primary, fontSize: 16 }}>← Retour</Text></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Modifier le cours</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    {newImage ? <Image source={{ uri: newImage.uri }} style={styles.previewImage} />
                    : currentImage ? <Image source={{ uri: API_URL.replace('/api', '') + currentImage }} style={styles.previewImage} />
                    : <Text style={{ fontSize: 40 }}>📚</Text>}
                    <Text style={[styles.imagePickerText, { color: colors.textSec }]}>Changer l'image</Text>
                </TouchableOpacity>

                <Text style={[styles.label, { color: colors.text }]}>Titre *</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} value={title} onChangeText={setTitle} />

                <Text style={[styles.label, { color: colors.text }]}>Professeur</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} value={professor} onChangeText={setProfessor} />

                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text, height: 80 }]} value={description} onChangeText={setDescription} multiline textAlignVertical="top" />

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={loading}>
                    <Text style={styles.submitText}>{loading ? 'Enregistrement...' : '💾 Enregistrer'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 20 },
    imagePicker: { height: 180, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 20, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePickerText: { fontSize: 12, marginTop: 8 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 2, borderRadius: 12, padding: 12, fontSize: 14 },
    submitBtn: { padding: 16, borderRadius: 50, alignItems: 'center', marginTop: 24 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});