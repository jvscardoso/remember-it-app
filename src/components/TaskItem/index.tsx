import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
} from 'react-native';

import Toast from 'react-native-toast-message';
import { TaskStatus, TasksTypes } from '../../types/Task';
import api from '../../services/api';
import { getDBConnection, updateTask } from '../../database/taskRepository';
import { useNetworkSync } from '../../hooks/useNetwork';

type Props = {
  task: TasksTypes;
  onTaskCompleted?: () => void;
};

export default function TaskItem({ task, onTaskCompleted }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isOnline } = useNetworkSync();

  async function handleCompleteTask() {
    try {
      if (isOnline) {
        await api.patch(`/tasks/${task.id}`, { status: 'COMPLETED' });
      } else {
        const db = await getDBConnection();
        await updateTask(db, task.id, {
          status: TaskStatus.COMPLETED,
          isSynced: 0,
          updatedAt: new Date().toISOString(),
        });
      }
      Toast.show({ type: 'success', text1: 'Tarefa concluída com sucesso!' });
      onTaskCompleted?.();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro ao concluir tarefa' });
    } finally {
      setModalVisible(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.meta}>Status: {task.status}</Text>
        <Text style={styles.meta}>Prioridade: {task.priority}</Text>
        {task.dueDate && (
          <Text style={styles.meta}>
            Prazo: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {task.status !== 'COMPLETED' && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: '#fff' }}>✓</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text>Deseja concluir esta tarefa?</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Concluir" onPress={handleCompleteTask} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13, color: '#666' },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 40,
    padding: 20,
    borderRadius: 8,
    elevation: 4,
  },
  modalButtons: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
