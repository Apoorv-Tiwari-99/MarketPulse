import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { StockProvider } from '../contexts/StockContext';
import './global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <StockProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="stock/[symbol]" options={{ 
                headerShown: true, 
                title: 'Stock Details',
                headerStyle: { backgroundColor: '#f8fafc' },
                headerTintColor: '#1e293b',
              }} />
            </Stack>
          </StockProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}