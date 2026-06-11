import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        loadUser();
        const unsubscribe = navigation.addListener('focus', loadUser);
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (user) loadCourses();
    }, [user]);

    const loadUser = async () => {
        const u = await AsyncStorage.getItem('currentUser');
        if (u) setUser(JSON.parse(u));
    };

    const loadCourses = async () => {
        if (!user) return;
        try {
            const data = await api.getCourses(user.matricule);
            if (data.success) setCourses(data.courses);
        } catch (e) {}
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('currentUser');
        navigation.replace('Login');
    };

    const renderCourse = ({ item }) => (
        <TouchableOpacity style={styles.courseCard} onPress={() => navigation.navigate('Course', { courseId: item.id, title: item.title })}>
            <View style={styles.courseIcon}><Text style={styles.courseIconText}>📚</Text></View>
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.courseMeta}>📝 {item.noteCount || 0} note(s) • {item.professor || '---------'}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📚 Mes Cours</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.logoutBtn}>Déconnexion</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={courses}
                renderItem={renderCourse}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📖</Text>
                        <Text style={styles.emptyText}>Aucun cours pour le moment</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddCourse')}>
                <Text style={styles.addBtnText}>+ Ajouter un cours</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'rgba(15,23,42,0.9)' },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
    logoutBtn: { color: '#f87171', fontSize: 14, fontWeight: '600' },
    list: { padding: 16 },
    courseCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: 16,
        padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
    },
    courseIcon: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(99,102,241,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    courseIconText: { fontSize: 24 },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
    courseMeta: { fontSize: 13, color: '#94a3b8' },
    arrow: { fontSize: 24, color: '#6366f1', marginLeft: 8 },
    empty: { alignItems: 'center', padding: 60 },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyText: { color: '#94a3b8', fontSize: 16 },
    addBtn: { backgroundColor: '#6366f1', margin: 16, padding: 16, borderRadius: 50, alignItems: 'center' },
    addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});