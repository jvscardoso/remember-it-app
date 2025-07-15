import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

type HeaderProps = {
  title: string;
  description?: string;
  showBackButton?: boolean;
  networkStatus?: boolean; // online ou offline
  onSync?: () => void; // função para sincronizar
};

export default function Header({
  title,
  description,
  showBackButton = false,
  networkStatus,
  onSync,
}: HeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>

      {networkStatus && onSync && (
        <TouchableOpacity onPress={onSync} style={styles.syncButton}>
          <RefreshCw size={22} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  syncButton: {
    padding: 6,
  },
});
