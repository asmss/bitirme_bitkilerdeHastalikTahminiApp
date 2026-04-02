import React from 'react';
import { AuthProvider } from './src/context/authContext';
import { KayitProvider } from './src/context/kayitContext';
import AppNav from './src/nav/appNav';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <KayitProvider>
          <AppNav />
        </KayitProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}