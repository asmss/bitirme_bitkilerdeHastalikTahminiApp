import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const BildirimAyarlarModal = ({ visible, onClose, onSave, initialBildirimler = [] }) => {
    const [bildirimler, setBildirimler] = useState(
        initialBildirimler.length > 0
            ? initialBildirimler
            : [{ turu: 'gun_oncesi', gun: 1, saat: '09:00', aktif: true, gonderildi: false }]
    );

    const [showTimePicker, setShowTimePicker] = useState(null);

    const handleAddBildirim = () => {
        setBildirimler([...bildirimler, { turu: 'gun_oncesi', gun: 0, saat: '09:00', aktif: true, gonderildi: false }]);
    };

    const handleRemoveBildirim = (index) => {
        setBildirimler(bildirimler.filter((_, i) => i !== index));
    };

    const handleBildirimChange = (index, field, value) => {
        const newBildirimler = [...bildirimler];
        newBildirimler[index] = { ...newBildirimler[index], [field]: value };
        setBildirimler(newBildirimler);
    };

    const handleTimeChange = (index, event, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios' ? index : null);
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            const saat = `${hours}:${minutes}`;
            handleBildirimChange(index, 'saat', saat);
        }
    };

    const handleSave = () => {
        if (bildirimler.length === 0) {
            Alert.alert('Hata', 'En az bir bildirim ayarı olmalı.');
            return;
        }
        onSave(bildirimler);
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Hatırlatıcılar</Text>
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Bitti</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {bildirimler.map((bildirim, index) => (
                            <View key={index} style={[styles.card, !bildirim.aktif && styles.cardDisabled]}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.titleRow}>
                                        <Ionicons name="notifications" size={18} color={bildirim.aktif ? "#2E7D32" : "#9E9E9E"} />
                                        <Text style={[styles.cardTitle, !bildirim.aktif && styles.textDisabled]}>Alarm {index + 1}</Text>
                                    </View>
                                    <View style={styles.actionRow}>
                                        {bildirimler.length > 1 && (
                                            <TouchableOpacity onPress={() => handleRemoveBildirim(index)} style={styles.deleteButton}>
                                                <Ionicons name="trash-outline" size={18} color="#E53935" />
                                            </TouchableOpacity>
                                        )}
                                        <Switch
                                            value={bildirim.aktif}
                                            onValueChange={(val) => handleBildirimChange(index, 'aktif', val)}
                                            trackColor={{ false: '#E2E8F0', true: '#81C784' }}
                                            thumbColor={bildirim.aktif ? '#2E7D32' : '#FFFFFF'}
                                        />
                                    </View>
                                </View>

                                {bildirim.aktif && (
                                    <View style={styles.cardBody}>
                                        <Text style={styles.label}>Tetiklenme Zamanı</Text>
                                        <View style={styles.typeButtons}>
                                            <TouchableOpacity
                                                style={[styles.typeButton, bildirim.turu === 'gun_oncesi' && styles.typeButtonActive]}
                                                onPress={() => handleBildirimChange(index, 'turu', 'gun_oncesi')}
                                            >
                                                <Text style={[styles.typeButtonText, bildirim.turu === 'gun_oncesi' && styles.typeButtonTextActive]}>Gün Öncesi</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.typeButton, bildirim.turu === 'saat' && styles.typeButtonActive]}
                                                onPress={() => handleBildirimChange(index, 'turu', 'saat')}
                                            >
                                                <Text style={[styles.typeButtonText, bildirim.turu === 'saat' && styles.typeButtonTextActive]}>Tam Saatinde</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {bildirim.turu === 'gun_oncesi' && (
                                            <View style={styles.pillContainer}>
                                                {[0, 1, 2, 3].map((gun) => (
                                                    <TouchableOpacity
                                                        key={gun}
                                                        style={[styles.pill, bildirim.gun === gun && styles.pillActive]}
                                                        onPress={() => handleBildirimChange(index, 'gun', gun)}
                                                    >
                                                        <Text style={[styles.pillText, bildirim.gun === gun && styles.pillTextActive]}>
                                                            {gun === 0 ? 'Bugün' : `${gun} Gün`}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}

                                        <Text style={styles.label}>Saat Kaçta Çalsın?</Text>
                                        <TouchableOpacity style={styles.timeSelector} onPress={() => setShowTimePicker(index)}>
                                            <Ionicons name="time-outline" size={22} color="#2E7D32" />
                                            <Text style={styles.timeSelectorText}>{bildirim.saat}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addButton} onPress={handleAddBildirim}>
                            <Ionicons name="add" size={20} color="#2E7D32" />
                            <Text style={styles.addButtonText}>Yeni Alarm Ekle</Text>
                        </TouchableOpacity>
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    {showTimePicker !== null && (
                        Platform.OS === 'ios' ? (
                            <View style={styles.iosPickerContainer}>
                                <View style={styles.iosPickerHeader}>
                                    <TouchableOpacity onPress={() => setShowTimePicker(null)}>
                                        <Text style={styles.iosPickerDoneText}>Tamam</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={new Date(`2024-01-01T${bildirimler[showTimePicker].saat}:00`)}
                                    mode="time"
                                    display="spinner"
                                    textColor="#000000" 
                                    onChange={(e, time) => {
                                        if (time) {
                                            const saat = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
                                            handleBildirimChange(showTimePicker, 'saat', saat);
                                        }
                                    }}
                                />
                            </View>
                        ) : (
                            <DateTimePicker
                                value={new Date(`2024-01-01T${bildirimler[showTimePicker].saat}:00`)}
                                mode="time"
                                display="default"
                                onChange={(e, time) => {
                                    if (Platform.OS === 'android') setShowTimePicker(null);
                                    if (time && (e.type === "set" || Platform.OS === 'ios')) {
                                        const hours = time.getHours().toString().padStart(2, '0');
                                        const minutes = time.getMinutes().toString().padStart(2, '0');
                                        const saat = `${hours}:${minutes}`;
                                        handleBildirimChange(showTimePicker, 'saat', saat);
                                    }
                                }}
                            />
                        )
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: '#F7FAFC',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    iconButton: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#2D3748' },
    saveButton: { backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    saveButtonText: { color: '#2E7D32', fontWeight: '700', fontSize: 14 },
    content: { padding: 16 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    cardDisabled: { opacity: 0.7, backgroundColor: '#F8FAFC' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748' },
    textDisabled: { color: '#A0AEC0' },
    deleteButton: { padding: 4, backgroundColor: '#FEE2E2', borderRadius: 8 },
    cardBody: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
    label: { fontSize: 13, fontWeight: '600', color: '#718096', marginBottom: 8, marginTop: 8 },
    typeButtons: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    typeButton: {
        flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10,
        backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0'
    },
    typeButtonActive: { backgroundColor: '#E8F5E9', borderColor: '#81C784' },
    typeButtonText: { fontSize: 13, fontWeight: '600', color: '#718096' },
    typeButtonTextActive: { color: '#2E7D32' },
    pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
    pillActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    pillText: { fontSize: 13, fontWeight: '600', color: '#718096' },
    pillTextActive: { color: '#FFFFFF' },
    timeSelector: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC',
        padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0'
    },
    timeSelectorText: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginLeft: 8 },
    addButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 16, borderRadius: 16, backgroundColor: '#E8F5E9', borderStyle: 'dashed', borderWidth: 1, borderColor: '#81C784'
    },
    addButtonText: { fontSize: 15, fontWeight: '700', color: '#2E7D32', marginLeft: 8 },
    iosPickerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        paddingBottom: 20,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iosPickerDoneText: {
        color: '#2E7D32',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BildirimAyarlarModal;