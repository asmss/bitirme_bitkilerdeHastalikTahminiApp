 import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const AsistanScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Merhaba! Ben bitki asistanın. Bitkilerin hakkında bana istediğini sorabilirsin. ', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

 const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage = { id: userMessageId, text: input, isUser: true };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/asistan/soru', { prompt: currentInput });
      
      const botMessageId = `bot-${Date.now()}`;
      const botMessage = { 
        id: botMessageId, 
        text: response.data.answer, 
        isUser: false 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessageId = `err-${Date.now()}`;
      setMessages(prev => [...prev, { 
        id: errorMessageId, 
        text: "Üzgünüm, bir hata oluştu. Lütfen tekrar dene."+error.message, 
        isUser: false 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
      keyboardVerticalOffset={-1}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bitki Uzmanı Asistan</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {loading && <ActivityIndicator color="#2E7D32" style={{ marginBottom: 15 }} />}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Sorunu buraya yaz..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#2E7D32', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  messageBubble: { padding: 12, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2E7D32' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0' },
  messageText: { fontSize: 15 },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, maxHeight: 100 },
  sendButton: { backgroundColor: '#2E7D32', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }
});

export default AsistanScreen;