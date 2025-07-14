import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Pencil, Trash2 } from 'lucide-react-native';

import Header from '../../../components/Header';
import api from '../../../services/api';
import { TasksTypes } from '../../../types/Task';

type RouteParams = {
  TaskDetails: { id: string };
};

export default function TaskDetails() {
  const route = useRoute<RouteProp<RouteParams, 'TaskDetails'>>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [task, setTask] = useState<TasksTypes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTask() {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data);
      } catch (error) {
        console.warn('Erro ao buscar tarefa:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [id]);

  const handleEdit = () => {
    if (task) {
      navigation.navigate('TaskForm' as never, { task } as never);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Excluir tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: handleDelete },
      ],
    );
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${id}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>Tarefa não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Detalhes da Tarefa"
        description="Informações completas"
        showBackButton
      />

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
          <Pencil color="#444" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete} style={styles.iconButton}>
          <Trash2 color="#c00" size={22} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{task.title}</Text>

      {task.description ? (
        <Text style={styles.description}>{task.description}</Text>
      ) : (
        <Text style={styles.description}>Sem descrição</Text>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.label}>
          <Text style={styles.labelTitle}>Status:</Text> {task.status}
        </Text>
        <Text style={styles.label}>
          <Text style={styles.labelTitle}>Prioridade:</Text> {task.priority}
        </Text>
        {task.dueDate && (
          <Text style={styles.label}>
            <Text style={styles.labelTitle}>Prazo:</Text>{' '}
            {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
        <Text style={styles.label}>
          <Text style={styles.labelTitle}>Criada em:</Text>{' '}
          {new Date(task.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, color: '#444', marginBottom: 20 },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  labelTitle: {
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 10,
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#eaeaea',
  },
});
