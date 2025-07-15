import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth.tsx';
import api from '../../services/api.tsx';
import { COLORS } from '../../theme/palette.ts';

const { width } = Dimensions.get('window');

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
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await api.get<MeResponse>('/users/me');
      setUserData(response.data);
    } catch (err) {
      console.warn('Erro ao buscar perfil:', err);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os dados do perfil. Tente novamente.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  const handleRefresh = () => {
    fetchProfile(true);
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `Membro há ${diffDays} dias`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Membro há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Membro há ${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return COLORS.success;
    if (percentage >= 60) return COLORS.primary;
    if (percentage >= 40) return COLORS.warning;
    return COLORS.error;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>⚠️</Text>
          </View>
          <Text style={styles.errorTitle}>Erro ao carregar perfil</Text>
          <Text style={styles.errorMessage}>
            Não foi possível carregar os dados do seu perfil.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchProfile()}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { name, email, createdAt, stats } = userData;
  const progressColor = getProgressColor(stats.completedPercentage);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
              </View>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: COLORS.success },
                ]}
              />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{email}</Text>
              <Text style={styles.memberSince}>
                {formatMemberSince(createdAt)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIcon}>
              <Text style={styles.logoutIconText}>↗</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progresso Geral</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressPercentage}>
                {stats.completedPercentage}%
              </Text>
              <Text style={styles.progressLabel}>Concluído</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${stats.completedPercentage}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.progressDescription}>
              {stats.completedTasks} de {stats.totalTasks} tarefas concluídas
            </Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.totalTasksCard]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📋</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalTasks}</Text>
              <Text style={styles.statLabel}>Total de Tarefas</Text>
            </View>

            <View style={[styles.statCard, styles.completedTasksCard]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text style={styles.statValue}>{stats.completedTasks}</Text>
              <Text style={styles.statLabel}>Concluídas</Text>
            </View>

            <View style={[styles.statCard, styles.inProgressTasksCard]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⏳</Text>
              </View>
              <Text style={styles.statValue}>{stats.inProgressTasks}</Text>
              <Text style={styles.statLabel}>Em Andamento</Text>
            </View>

            <View style={[styles.statCard, styles.pendingTasksCard]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📝</Text>
              </View>
              <Text style={styles.statValue}>
                {stats.totalTasks -
                  stats.completedTasks -
                  stats.inProgressTasks}
              </Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray600,
    marginTop: 16,
  },

  // Error States
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.red50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  logoutButton: {
    backgroundColor: COLORS.red500,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.red500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutIcon: {
    transform: [{ rotate: '45deg' }],
  },
  logoutIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  progressSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  progressLabel: {
    fontSize: 16,
    color: COLORS.gray600,
    marginTop: 4,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDescription: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalTasksCard: {
    backgroundColor: COLORS.blue50,
  },
  completedTasksCard: {
    backgroundColor: COLORS.green50,
  },
  inProgressTasksCard: {
    backgroundColor: COLORS.amber50,
  },
  pendingTasksCard: {
    backgroundColor: COLORS.red50,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    fontWeight: '500',
  },
});
