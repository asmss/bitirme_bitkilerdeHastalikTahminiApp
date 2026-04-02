import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { AuthContext } from '../context/authContext';

const HomeScreen = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);


  const { logout } = useContext(AuthContext);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Kamera izni verilmedi!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'plant_image.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await api.post('/scan/resim_tanitma', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.succes) {
        setResult(response.data.data);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Hata", "Analiz sırasında bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Evet", onPress: () => logout() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bitki Analizi</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={28} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }}>

        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <Ionicons name="image-outline" size={80} color="#ccc" />
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.buttonText}>Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#558B2F' }]} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.buttonText}>Galeri</Text>
          </TouchableOpacity>
        </View>

        {image && !result && (
          <TouchableOpacity style={styles.analyzeButton} onPress={uploadImage} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.analyzeText}>Analiz Et</Text>}
          </TouchableOpacity>
        )}
        {result && (
          <View style={styles.resultCard}>
            {result.status === 'unknown' ? (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Ionicons name="alert-circle" size={100} color="#d32f2f" />
                <Text style={[styles.resultTitle, { color: '#d32f2f', marginTop: 20 }]}>
                  Tanımlanamadı
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultTitle}>Analiz Sonucu</Text>
                {/* <View style={styles.resultItem}>
                  <Text style={styles.label}>Bitki:</Text>
                  <Text style={styles.value}>{result.plant_name} (%{result.plant_confidence})</Text>
                </View> */}
                <View style={styles.resultItem}>
                  <Text style={styles.label}>Hastalık:</Text>
                  <Text style={[styles.value, { color: '#d32f2f' }]}>{result.disease_name}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.label}>Güven Oranı:</Text>
                  <Text style={styles.value}>%{result.disease_confidence}</Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  logoutButton: { padding: 5 },
  imageBox: { width: 300, height: 300, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, overflow: 'hidden', marginBottom: 20, marginTop: 10 },
  previewImage: { width: '100%', height: '100%' },
  buttonRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  actionButton: { backgroundColor: '#2E7D32', flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center', gap: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  analyzeButton: { backgroundColor: '#FF8F00', width: '80%', padding: 18, borderRadius: 12, alignItems: 'center' },
  analyzeText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 20, marginTop: 20, elevation: 4, marginBottom: 30 },
  resultTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', marginBottom: 15, textAlign: 'center' },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingBottom: 5 },
  label: { fontWeight: 'bold', color: '#555' },
  value: { color: '#2E7D32', fontWeight: '600' }
});

export default HomeScreen;