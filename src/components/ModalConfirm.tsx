import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface Props {
    visible: boolean;
    title?: string;
    message?: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    confirmColor?: string;
}

export default function ModalConfirm({ visible, title, message, onCancel, onConfirm, confirmText, confirmColor }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>{title || 'Confirmation'}</Text>
                    {message ? <Text style={styles.message}>{message}</Text> : null}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onCancel}><Text style={styles.btnCancelText}>Annuler</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.btnConfirm, { backgroundColor: confirmColor || '#6366f1' }]} onPress={onConfirm}><Text style={styles.btnConfirmText}>{confirmText || 'Confirmer'}</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { backgroundColor: '#0f172a', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
    title: { color: '#f1f5f9', fontSize: 17, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
    message: { color: '#94a3b8', fontSize: 14, marginBottom: 20, textAlign: 'center' },
    actions: { flexDirection: 'row', gap: 10 },
    btnCancel: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    btnCancelText: { color: '#94a3b8', fontWeight: '600' },
    btnConfirm: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
    btnConfirmText: { color: '#fff', fontWeight: '600' },
});