import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation';
import { AuthProvider } from './context/AuthContext';
import Toast from 'react-native-toast-message';
import { useNetworkSync } from './hooks/useNetwork';

export default function App() {
  useNetworkSync();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
