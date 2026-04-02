import React, { useEffect, useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { KayitContext } from '../context/kayitContext';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ChatRecordItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const tarihFormat = new Date(item.tarih).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={toggleExpand} 
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{tarihFormat}</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={18} 
          color="#9E9E9E" 
        />
      </View>

      <View style={styles.soruContainer}>
        <Text style={styles.soruLabel}>Sen:</Text>
        <Text style={styles.soruText}>{item.soru}</Text>
      </View>

      <View style={[styles.cevapContainer, expanded ? styles.cevapExpanded : null]}>
        <Text style={styles.cevapLabel}>Asistan:</Text>
        <Text 
          style={styles.cevapText} 
          numberOfLines={expanded ? undefined : 3}
        >
          {item.cevap}
        </Text>
      </View>
      
      {!expanded && (
        <Text style={styles.moreText}>Devamını oku...</Text>
      )}
    </TouchableOpacity>
  );
};

const SohbetGecmisScreen = () => {
  const { sohbetler, loadingSohbet, fetchSohbetGecmisi } = useContext(KayitContext);

  useEffect(() => {
    fetchSohbetGecmisi();
  }, []);

  if (loadingSohbet) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10 }}>Geçmiş yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sohbetler.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Henüz bir sohbet kaydınız bulunmuyor. </Text>
        </View>
      ) : (
        <FlatList
          data={sohbetler}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ChatRecordItem item={item} />}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F8E9' },
  emptyText: { fontSize: 16, color: '#757575' },
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 } 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  dateText: { fontSize: 12, color: '#9E9E9E' },
  soruContainer: { backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, marginBottom: 10 },
  soruLabel: { fontWeight: 'bold', color: '#2E7D32', marginBottom: 2 },
  soruText: { color: '#333' },
  cevapContainer: { backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8 },
  cevapLabel: { fontWeight: 'bold', color: '#1565C0', marginBottom: 2 },
  cevapText: { color: '#555', fontSize: 14, lineHeight: 20 },
  cevapExpanded: {
  },
  moreText: {
    textAlign: 'center',
    color: '#2E7D32',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic'
  }
});

export default SohbetGecmisScreen;