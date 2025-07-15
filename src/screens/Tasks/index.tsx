import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
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
import { useNetworkSync } from '../../hooks/useNetwork.ts';
import Toast from 'react-native-toast-message';

export default function Tasks() {
  const [tasks, setTasks] = useState<TasksTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const navigation = useNavigation<any>();
  const { isOnline } = useNetworkSync();

  /** Busca tarefas (online ou offline) */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDBConnection();

      if (isOnline) {
        const response = await api.get('/tasks');
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
        setTasks(localTasks as TasksTypes[]);
      }
    } catch (error) {
      console.warn('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline]);

  const syncTasks = useCallback(async () => {
    if (!isOnline) {
      Alert.alert('Aviso', 'Conecte-se à internet para sincronizar.');
      return;
    }

    try {
      setSyncing(true);
      const db = await getDBConnection();
      const unsyncedTasks = await getUnsyncedTasks(db);

      if (unsyncedTasks.length === 0) {
        Toast.show({ type: 'info', text1: 'Tudo sincronizado!' });
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

      Toast.show({ type: 'success', text1: 'Sincronização concluída!' });
      await fetchTasks();
    } catch (error) {
      Alert.alert('Erro', 'Falha na sincronização.');
    } finally {
      setSyncing(false);
    }
  }, [isOnline, fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const renderItem = ({ item }: { item: TasksTypes }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TaskDetails', { id: item.id })}
      style={styles.taskContainer}
    >
      <TaskItem task={item} onTaskCompleted={fetchTasks} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Minhas Tarefas"
        description={isOnline ? 'Online' : 'Offline'}
        networkStatus={isOnline}
        onSync={syncTasks}
      />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {!loading &&
        (tasks.length === 0 ? (
          <Text style={styles.empty}>Nenhuma tarefa encontrada.</Text>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        ))}

      {syncing && (
        <Text style={{ textAlign: 'center', marginBottom: 8, color: '#666' }}>
          Sincronizando...
        </Text>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('TaskForm')}
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    marginBottom: 2,
  },
  taskContainer: {
    position: 'relative',
    marginBottom: 16,
  },
});
