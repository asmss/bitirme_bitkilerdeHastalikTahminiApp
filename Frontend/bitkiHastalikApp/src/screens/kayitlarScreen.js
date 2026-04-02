import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const KayitlarScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Geçmiş Kayıtlarım</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AnalizGecmis')} 
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="scan-outline" size={32} color="#2E7D32" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Fotoğraf Analizleri</Text>
            <Text style={styles.cardSubtitle}>Bitki hastalık tahmini sonuçların</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9E9E9E" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SohbetGecmis')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="chatbubbles-outline" size={32} color="#1565C0" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Asistan Sohbetleri</Text>
            <Text style={styles.cardSubtitle}>Uzman ile yaptığın görüşmeler</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#2E7D32', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardsContainer: { paddingHorizontal: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#757575' }
});

export default KayitlarScreen;