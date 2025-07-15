import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  getDBConnection,
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  getUnsyncedTasks,
  markTaskAsSynced,
} from '../../database/taskRepository';
import api from '../../services/api';
import TaskItem from '../../components/TaskItem';
import { TaskPriority, TaskStatus, TasksTypes } from '../../types/Task';
import Header from '../../components/Header';
import FilterModal from '../../components/FilterModal';
import { useNetworkSync } from '../../hooks/useNetwork.ts';
import Toast from 'react-native-toast-message';

export default function Tasks() {
  const [tasks, setTasks] = useState<TasksTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const { isOnline } = useNetworkSync();

  const fabScale = new Animated.Value(1);
  const syncOpacity = useRef(new Animated.Value(0)).current;

  const fetchTasks = useCallback(
    async (statusFilter?: string) => {
      setLoading(true);
      try {
        const db = await getDBConnection();
        const filterStatus = statusFilter || selectedStatus;

        if (isOnline) {
          let apiUrl = '/tasks';
          if (filterStatus !== 'ALL') {
            apiUrl += `?status=${filterStatus}`;
          }

          const response = await api.get(apiUrl);
          const apiTasks: TasksTypes[] = response.data;

          for (const t of apiTasks) {
            const existingTask = await getTaskById(db, t.id);

            const status = Object.values(TaskStatus).includes(
              t.status as TaskStatus,
            )
              ? (t.status as TaskStatus)
              : TaskStatus.PENDING;

            const priority = Object.values(TaskPriority).includes(
              t.priority as TaskPriority,
            )
              ? (t.priority as TaskPriority)
              : TaskPriority.MEDIUM;

            const taskData = {
              id: t.id,
              title: t.title,
              description: t.description,
              status,
              priority,
              dueDate: t.dueDate,
              createdAt: t.createdAt,
              updatedAt: t.updatedAt,
              isSynced: 1 as const,
            };

            if (existingTask) {
              await updateTask(db, t.id, taskData);
            } else {
              await createTask(db, taskData);
            }
          }

          setTasks(apiTasks);
        } else {
          const localTasks = await getTasks(db);
          const filteredTasks =
            filterStatus === 'ALL'
              ? localTasks
              : localTasks.filter(task => task.status === filterStatus);

          setTasks(filteredTasks as TasksTypes[]);
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao carregar tarefas',
          text2: 'Verifique sua conexão e tente novamente',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isOnline, selectedStatus],
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      setSelectedStatus(status);
      fetchTasks(status);
    },
    [fetchTasks],
  );

  const handleFilterPress = () => {
    setFilterModalVisible(true);
  };

  const handleFilterClose = () => {
    setFilterModalVisible(false);
  };

  const syncTasks = useCallback(async () => {
    if (!isOnline) {
      Alert.alert(
        'Sem conexão',
        'Conecte-se à internet para sincronizar suas tarefas.',
        [{ text: 'OK', style: 'default' }],
      );
      return;
    }

    try {
      setSyncing(true);
      Animated.timing(syncOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const db = await getDBConnection();
      const unsyncedTasks = await getUnsyncedTasks(db);

      if (unsyncedTasks.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'Tudo sincronizado!',
          text2: 'Suas tarefas estão atualizadas',
        });
        return;
      }

      for (const task of unsyncedTasks) {
        try {
          if (task.id && (await getTaskById(db, task.id))) {
            await api.patch(`/tasks/${task.id}`, task);
          } else {
            const response = await api.post('/tasks', task);
            task.id = response.data.id;
          }

          await markTaskAsSynced(db, task.id);
        } catch (err) {
          console.warn('Erro ao sincronizar tarefa:', task.title, err);
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Sincronização concluída!',
        text2: `${unsyncedTasks.length} tarefa(s) sincronizada(s)`,
      });
      await fetchTasks();
    } catch (error) {
      Alert.alert(
        'Erro na sincronização',
        'Não foi possível sincronizar suas tarefas. Tente novamente.',
        [{ text: 'OK', style: 'default' }],
      );
    } finally {
      setSyncing(false);
      Animated.timing(syncOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline, fetchTasks, syncOpacity]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('TaskForm');
  };

  const renderItem = ({ item }: { item: TasksTypes; index: number }) => (
    <View style={styles.taskWrapper}>
      <TouchableOpacity
        onPress={() => navigation.navigate('TaskDetails', { id: item.id })}
        activeOpacity={0.7}
      >
        <TaskItem task={item} onTaskCompleted={fetchTasks} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {selectedStatus === 'ALL'
          ? 'Nenhuma tarefa ainda'
          : 'Nenhuma tarefa encontrada'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {selectedStatus === 'ALL'
          ? 'Comece criando sua primeira tarefa tocando no botão +'
          : 'Tente alterar o filtro ou criar uma nova tarefa'}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text style={styles.loadingText}>Carregando tarefas...</Text>
    </View>
  );

  const getFilteredTaskStats = () => {
    const completed = tasks.filter(
      t => t.status === TaskStatus.COMPLETED,
    ).length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgress = tasks.filter(
      t => t.status === TaskStatus.IN_PROGRESS,
    ).length;

    return { completed, pending, inProgress, total: tasks.length };
  };

  const stats = getFilteredTaskStats();

  return (
    <View style={styles.container}>
      <Header
        title="Minhas Tarefas"
        description={isOnline ? 'Online' : 'Offline'}
        networkStatus={isOnline}
        onSync={syncTasks}
        onFilterPress={handleFilterPress}
      />

      <FilterModal
        visible={filterModalVisible}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        onClose={handleFilterClose}
      />

      {!loading && tasks.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>
              {selectedStatus === 'ALL' ? 'Total' : 'Filtradas'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
              {stats.inProgress}
            </Text>
            <Text style={styles.statLabel}>Em Progresso</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
        </View>
      )}

      {syncing && (
        <Animated.View style={[styles.syncContainer, { opacity: syncOpacity }]}>
          <ActivityIndicator size="small" color="#6366F1" />
          <Text style={styles.syncText}>Sincronizando tarefas...</Text>
        </Animated.View>
      )}

      <View style={styles.content}>
        {loading ? (
          renderLoadingState()
        ) : tasks.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#6366F1']}
                tintColor="#6366F1"
                progressBackgroundColor="#FFFFFF"
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  syncText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4338CA',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  taskWrapper: {
    marginBottom: 2,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
});
