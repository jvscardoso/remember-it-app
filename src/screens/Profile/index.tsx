import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../../hooks/useAuth.tsx';

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bem-vindo, {user?.name}</Text>
      <Button title="Sair" onPress={signOut} />
    </View>
  );
}
