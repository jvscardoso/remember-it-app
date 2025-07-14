import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation';
import { AuthProvider } from './context/AuthContext.tsx';
import Config from 'react-native-config';
import Toast from 'react-native-toast-message';

export default function App() {
  console.log('chave api:', Config.BASE_URL);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

