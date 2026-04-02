import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import BildirimAyarlarModal from './bildirimAyarlar';
import api from '../services/api';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const YeniGorevModal = ({ visible, onClose, onSuccess }) => {
    const [bitkiAd, setBitkiAd] = useState('');
    const [hastalik, setHastalik] = useState('');
    const [gorev, setGorev] = useState('');
    const [tarih, setTarih] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showBildirimModal, setShowBildirimModal] = useState(false);
    const [bildirimler, setBildirimler] = useState([
        { turu: 'gun_oncesi', gun: 1, saat: '09:00', aktif: true }
    ]);

    useEffect(() => {
        if (visible) {
            registerForNotifications();
        }
    }, [visible]);

    const registerForNotifications = async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#2E7D32',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                return;
            }
        }
    };

    const scheduleLocalNotifications = async () => {
        try {
            for (const b of bildirimler) {
                if (!b.aktif) continue;

                const taskDate = new Date(tarih);
                const scheduledTime = new Date(
                    taskDate.getFullYear(),
                    taskDate.getMonth(),
                    taskDate.getDate(),
                    0, 0, 0, 0
                );

                const [hour, minute] = b.saat.split(':');

                if (b.turu === 'gun_oncesi') {
                    scheduledTime.setDate(scheduledTime.getDate() - b.gun);
                }

                scheduledTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

                if (scheduledTime > new Date()) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: `Bitki Bakım Hatırlatıcısı`,
                            body: `${bitkiAd || 'Bitkiniz'} için: ${gorev}`,
                            sound: 'default',
                            priority: Notifications.AndroidNotificationPriority.MAX,
                        },
                        trigger: {
                            channelId: 'default',
                            date: scheduledTime.getTime()
                        },
                    });
                }
            }
        } catch (e) {
            console.log("Bildirim planlama hatası:", e);
        }
    };

    const handleKaydet = async () => {
        if (!gorev.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen görev açıklamasını girin.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/takvim/ekle', {
                bitkiAd: bitkiAd || 'Belirtilmedi',
                hastalik: hastalik || 'Genel Bakım',
                gorev: gorev.trim(),
                tarih: tarih.toISOString(),
                bildirimler
            });

            await scheduleLocalNotifications();

            Alert.alert('Başarılı', 'Görev takvime eklendi ve bildirimler kuruldu.');

            setBitkiAd(''); setHastalik(''); setGorev('');
            onSuccess();
            onClose();
        } catch (err) {
            Alert.alert('Hata', 'Görev kaydedilemedi. Lütfen internet bağlantınızı kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <View style={styles.sheet}>
                    <View style={styles.indicator} />

                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.headerAction}>
                            <Text style={styles.cancelText}>Vazgeç</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Yeni Görev</Text>
                        <TouchableOpacity onPress={handleKaydet} disabled={loading} style={styles.headerAction}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#2E7D32" />
                            ) : (
                                <Text style={styles.doneText}>Ekle</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>BİTKİ VE DURUM</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Bitki Adı"
                                    value={bitkiAd}
                                    onChangeText={setBitkiAd}
                                    placeholderTextColor="#A0AEC0"
                                />
                                <View style={styles.divider} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Hastalık / Konu"
                                    value={hastalik}
                                    onChangeText={setHastalik}
                                    placeholderTextColor="#A0AEC0"
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>GÖREV DETAYI</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, styles.multiline]}
                                    placeholder="Yapılacak işlem..."
                                    value={gorev}
                                    onChangeText={setGorev}
                                    multiline
                                    placeholderTextColor="#A0AEC0"
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>ZAMANLAMA</Text>
                            <View style={styles.inputContainer}>
                                <TouchableOpacity style={styles.row} onPress={() => setShowDatePicker(true)}>
                                    <View style={styles.rowLeft}>
                                        <Ionicons name="calendar" size={20} color="#2E7D32" />
                                        <Text style={styles.rowText}>Uygulama Tarihi</Text>
                                    </View>
                                    <Text style={styles.rowValue}>{tarih.toLocaleDateString('tr-TR')}</Text>
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <TouchableOpacity style={styles.row} onPress={() => setShowBildirimModal(true)}>
                                    <View style={styles.rowLeft}>
                                        <Ionicons name="notifications" size={20} color="#2E7D32" />
                                        <Text style={styles.rowText}>Hatırlatıcılar</Text>
                                    </View>
                                    <Text style={styles.rowValue}>{bildirimler.filter(b => b.aktif).length} Aktif</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    {showDatePicker && (
                        <View style={styles.iosPickerWrapper}>
                            <View style={styles.iosPickerContainer}>
                                <DateTimePicker
                                    value={tarih}
                                    mode="date"
                                    display="spinner" 
                                    textColor="black" 
                                    themeVariant="dark"
                                    onChange={(e, d) => {
                                        if (Platform.OS === 'android') {
                                            setShowDatePicker(false);
                                        }
                                        if (d) setTarih(d);
                                    }}
                                />

                                {Platform.OS === 'ios' && (
                                    <TouchableOpacity
                                        style={styles.closePickerButton}
                                        onPress={() => setShowDatePicker(false)}
                                    >
                                        <Text style={styles.closePickerText}>Tamam</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    <BildirimAyarlarModal
                        visible={showBildirimModal}
                        onClose={() => setShowBildirimModal(false)}
                        onSave={(b) => setBildirimler(b)}
                        initialBildirimler={bildirimler}
                    />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#F7F8FA',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    indicator: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginTop: 10 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A202C' },
    headerAction: { minWidth: 60, alignItems: 'center' },
    cancelText: { color: '#E53E3E', fontSize: 16 },
    doneText: { color: '#2E7D32', fontSize: 16, fontWeight: '700' },
    scroll: { flex: 1, padding: 16 },
    section: { marginBottom: 24 },
    sectionLabel: { fontSize: 12, fontWeight: '600', color: '#718096', marginLeft: 8, marginBottom: 8 },
    inputContainer: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: '#E2E8F0' },
    input: { padding: 16, fontSize: 16, color: '#2D3748' },
    multiline: { height: 100, textAlignVertical: 'top' },
    divider: { height: 0.5, backgroundColor: '#EDF2F7', marginHorizontal: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rowText: { fontSize: 16, color: '#2D3748' },
    rowValue: { fontSize: 15, color: '#718096' },
iosPickerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    iosPickerContainer: {
        backgroundColor: 'white', 
        borderRadius: 20,
        padding: 20,
        width: '85%',
        borderWidth: 1,
        borderColor: '#333', 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    closePickerButton: {
        backgroundColor: '#2E7D32', 
        padding: 15,
        borderRadius: 12,
        marginTop: 15,
        alignItems: 'center'
    },
    closePickerText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default YeniGorevModal;