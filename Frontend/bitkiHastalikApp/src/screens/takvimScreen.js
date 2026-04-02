import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import * as Notifications from 'expo-notifications';
import YeniGorevModal from './yeniGörev';
import BildirimAyarlarModal from './bildirimAyarlar';

LocaleConfig.locales['tr'] = {
    monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    monthNamesShort: ['Oca.', 'Şub.', 'Mar.', 'Nis.', 'May.', 'Haz.', 'Tem.', 'Ağu.', 'Eyl.', 'Eki.', 'Kas.', 'Ara.'],
    dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    dayNamesShort: ['Paz.', 'Pzt.', 'Sal.', 'Çar.', 'Per.', 'Cum.', 'Cmt.'],
    today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

const TakvimScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [markedDates, setMarkedDates] = useState({});
    const [showYeniGorevModal, setShowYeniGorevModal] = useState(false);
    const [showBildirimModal, setShowBildirimModal] = useState(false);
    const [selectedTaskForBildirim, setSelectedTaskForBildirim] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    const fetchTasks = async () => {
        try {
            const response = await api.get('/takvim/liste');
            const data = response.data.data;
            setTasks(data);

            let marks = {};
            data.forEach(item => {
                const dateKey = item.tarih.split('T')[0];
                marks[dateKey] = { marked: true, dotColor: item.tamamlandi ? '#9E9E9E' : '#2E7D32' };
            });
            setMarkedDates(marks);
        } catch (error) {
            console.error("Takvim verisi çekilemedi", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTasks();
    }, []);

    const toggleTask = async (id, currentStatus) => {
        try {
            await api.patch(`/takvim/guncelle/${id}`, { tamamlandi: !currentStatus });
            fetchTasks();
        } catch (error) {
            console.error("Güncelleme hatası", error);
        }
    };

    const handleBildirimDuzenle = (task) => {
        setSelectedTaskForBildirim(task);
        setShowBildirimModal(true);
    };

    const handleSaveBildirimler = async (bildirimler) => {
        try {
            await api.patch(`/takvim/bildirim/${selectedTaskForBildirim._id}`, {
                bildirimler: bildirimler
            });


            for (const b of bildirimler) {
                if (!b.aktif) continue;

                const taskDate = new Date(selectedTaskForBildirim.tarih);
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
                            title: `🌿 Bitki Bakım Hatırlatıcısı Güncellendi`,
                            body: `${selectedTaskForBildirim.bitkiAd} için: ${selectedTaskForBildirim.gorev}`,
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

            fetchTasks();
            setShowBildirimModal(false);
            setSelectedTaskForBildirim(null);
        } catch (error) {
            console.error("Bildirim güncelleme hatası", error);
        }
    };

    const filteredTasks = tasks.filter(task => task.tarih.split('T')[0] === selectedDate);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Takvim yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Tedavi Takvimi</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowYeniGorevModal(true)}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <Calendar
                onDayPress={day => setSelectedDate(day.dateString)}
                markedDates={{
                    ...markedDates,
                    [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: '#2E7D32' }
                }}
                theme={{
                    todayTextColor: '#2E7D32',
                    arrowColor: '#2E7D32',
                    dotColor: '#2E7D32',
                    backgroundColor:"#F1F8E9",
                }}
            />

            <View style={styles.taskListContainer}>
                <View style={styles.listHeaderContainer}>
                    <Text style={styles.listTitle}>{new Date(selectedDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })} Tarihli Görevler</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                        <Ionicons name="refresh" size={20} color="#2E7D32" />
                    </TouchableOpacity>
                </View>

                {filteredTasks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} color="#BDBDBD" />
                        <Text style={styles.emptyText}>Bugün için bir plan yok</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredTasks}
                        keyExtractor={item => item._id}
                        renderItem={({ item }) => (
                            <View style={styles.taskItem}>
                                <TouchableOpacity onPress={() => toggleTask(item._id, item.tamamlandi)}>
                                    <Ionicons
                                        name={item.tamamlandi ? "checkbox" : "square-outline"}
                                        size={28}
                                        color={item.tamamlandi ? "#2E7D32" : "#757575"}
                                    />
                                </TouchableOpacity>
                                <View style={styles.taskTextContainer}>
                                    <Text style={[styles.taskText, item.tamamlandi && styles.completedText]}>
                                        {item.gorev}
                                    </Text>
                                    <Text style={styles.subText}>{item.bitkiAd}</Text>

                                    {item.bildirimler && item.bildirimler.length > 0 && (
                                        <View style={styles.bildirimInfo}>
                                            <Ionicons name="notifications" size={12} color="#FF9800" />
                                            <Text style={styles.bildirimInfoText}>
                                                {item.bildirimler.filter(b => b.aktif).length} bildirim
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleBildirimDuzenle(item)}
                                    style={styles.bildirimButton}
                                >
                                    <Ionicons name="notifications-outline" size={20} color="#FF9800" />
                                </TouchableOpacity>
                            </View>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#2E7D32']}
                                tintColor="#2E7D32"
                            />
                        }
                        onEndReached={() => {
                            fetchTasks();
                        }}
                        onEndReachedThreshold={0.1}
                    />
                )}
            </View>

            <YeniGorevModal
                visible={showYeniGorevModal}
                onClose={() => setShowYeniGorevModal(false)}
                onSuccess={fetchTasks}
            />

            {selectedTaskForBildirim && (
                <BildirimAyarlarModal
                    visible={showBildirimModal}
                    onClose={() => setShowBildirimModal(false)}
                    onSave={handleSaveBildirimler}
                    initialBildirimler={selectedTaskForBildirim.bildirimler || []}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F8E9' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loadingText: { marginTop: 10, fontSize: 14, color: '#757575' },
    headerContainer: {
        position: 'relative',
        paddingBottom: 0,
    },
    header: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#2E7D32'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    addButton: {
        position: 'absolute',
        right: 20,
        top: 55,
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#FF9800',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    taskListContainer: { flex: 1, backgroundColor: '#F1F8E9' },
    listHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15
    },
    listTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    refreshButton: { padding: 8 },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2
    },
    taskTextContainer: {
        marginLeft: 15,
        flex: 1
    },
    taskText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500'
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#9E9E9E',
        fontWeight: '400'
    },
    subText: {
        fontSize: 12,
        color: '#757575',
        marginTop: 5
    },
    bildirimInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    bildirimInfoText: {
        fontSize: 11,
        color: '#FF9800',
        marginLeft: 4,
        fontWeight: '500',
    },
    bildirimButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 14,
        color: '#9E9E9E'
    }
});

export default TakvimScreen;