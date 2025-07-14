// src/screens/Tasks.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import TaskItem from '../../components/TaskItem';
import { TasksTypes } from '../../types/Task.ts';
import Header from '../../components/Header';

export default function Tasks() {
  const [tasks, setTasks] = useState<TasksTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.warn('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

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
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : tasks.length === 0 ? (
        <Text style={styles.empty}>Nenhuma tarefa encontrada.</Text>
      ) : (
        <>
          <Header title="My tasks" />

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
        </>
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
  editButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
});
