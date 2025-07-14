import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { LogOut } from 'lucide-react-native';

type UserStats = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completedPercentage: number;
};

type MeResponse = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  stats: UserStats;
};

export default function Profile() {
  const { signOut } = useAuth();
  const [userData, setUserData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get<MeResponse>('/users/me');
        setUserData(response.data);
      } catch (err) {
        console.warn('Erro ao buscar perfil:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text>Erro ao carregar perfil.</Text>
      </View>
    );
  }

  const { name, email, createdAt, stats } = userData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.since}>
            Membro desde {new Date(createdAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <LogOut color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalTasks}</Text>
          <Text style={styles.statLabel}>Tarefas totais</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedTasks}</Text>
          <Text style={styles.statLabel}>Concluídas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.inProgressTasks}</Text>
          <Text style={styles.statLabel}>Em andamento</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedPercentage}%</Text>
          <Text style={styles.statLabel}>% Concluídas</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  since: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: '#c00',
    padding: 8,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
