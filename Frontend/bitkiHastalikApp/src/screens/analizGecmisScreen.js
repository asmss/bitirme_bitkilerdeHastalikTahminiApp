import React, { useState, useContext,useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform, UIManager, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KayitContext } from '../context/kayitContext';
import api from '../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnalizItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const tarihFormat = new Date(item.tarih).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  const skorRengi = item.hastalikSkor > 0.8 ? '#2E7D32' : '#F57C00';

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={toggleExpand} 
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.dateText}>{tarihFormat}</Text>
          <Text style={styles.mainTitle}>{item.bitkiAd} - {item.hastalik}</Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up-circle" : "chevron-down-circle"} 
          size={24} 
          color="#2E7D32" 
        />
      </View>

      {expanded && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tespit Edilen Bitki:</Text>
            <Text style={styles.detailValue}>{item.bitkiAd}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hastalık Tahmini:</Text>
            <Text style={styles.detailValue}>{item.hastalik}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tahmin Güveni:</Text>
            <Text style={[styles.detailValue, { color: skorRengi, fontWeight: 'bold' }]}>
              %{(item.hastalikSkor).toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bitki Tanıma Skoru:</Text>
            <Text style={styles.detailValue}>%{(item.bitkiSkor).toFixed(2)}</Text>
          </View>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color="#555" />
            <Text style={styles.infoText}>
              Bu analiz yapay zeka tarafından yapılmıştır. Kesin sonuç için bir uzmana danışın.
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const AnalizGecmisScreen = () => {
  const { analizler, loadingAnaliz, fetchAnalizGecmisi } = useContext(KayitContext);

  useEffect(() => {
    fetchAnalizGecmisi();
  }, []);

  if (loadingAnaliz) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={analizler}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <AnalizItem item={item} />}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Henüz bir analiz kaydınız yok.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 12, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 11, color: '#888', marginBottom: 2 },
  mainTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  detailsContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { color: '#666', fontSize: 14 },
  detailValue: { color: '#333', fontSize: 14, fontWeight: '500' },
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF9C4', 
    padding: 10, 
    borderRadius: 8, 
    marginTop: 10,
    alignItems: 'center'
  },
  infoText: { fontSize: 11, color: '#555', marginLeft: 5, flex: 1 },
  emptyText: { color: '#999', fontSize: 16 }
});

export default AnalizGecmisScreen;