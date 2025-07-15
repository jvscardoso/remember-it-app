import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { TaskStatus, TasksTypes } from '../../types/Task';
import api from '../../services/api';
import { getDBConnection, updateTask } from '../../database/taskRepository';
import { useNetworkSync } from '../../hooks/useNetwork';

const { width } = Dimensions.get('window');

type Props = {
  task: TasksTypes;
  onTaskCompleted?: () => void;
};

export default function TaskItem({ task, onTaskCompleted }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isOnline } = useNetworkSync();

  const getPriorityConfig = () => {
    switch (task.priority) {
      case 'HIGH':
        return { color: '#DC2626', bg: '#FEF2F2', text: 'Alta' };
      case 'MEDIUM':
        return { color: '#D97706', bg: '#FFFBEB', text: 'Média' };
      case 'LOW':
        return { color: '#2563EB', bg: '#EFF6FF', text: 'Baixa' };
      default:
        return { color: '#6B7280', bg: '#F9FAFB', text: task.priority };
    }
  };

  const getStatusConfig = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return { color: '#059669', bg: '#ECFDF5', text: 'Concluída' };
      case TaskStatus.IN_PROGRESS:
        return { color: '#D97706', bg: '#FFFBEB', text: 'Em Andamento' };
      case TaskStatus.PENDING:
        return { color: '#6B7280', bg: '#F9FAFB', text: 'Pendente' };
      default:
        return { color: '#6B7280', bg: '#F9FAFB', text: task.status };
    }
  };

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

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const priorityConfig = getPriorityConfig();
  const statusConfig = getStatusConfig();

  return (
    <>
      <View style={[styles.container, isCompleted && styles.completedContainer]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isCompleted && styles.completedTitle]} numberOfLines={2}>
              {task.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bg }]}>
              <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
              <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                {priorityConfig.text}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <View style={[styles.statusIndicator, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>

            {task.dueDate && (
              <View style={styles.dueDateContainer}>
                <Text style={styles.dueDateLabel}>📅</Text>
                <Text style={styles.dueDateText}>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {!isCompleted && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.buttonText}>Concluir</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedSection}>
            <View style={styles.completedBadge}>
              <Text style={styles.completedIcon}>✓</Text>
              <Text style={styles.completedText}>Concluída</Text>
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <Pressable onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalIconContainer}>
                      <Text style={styles.modalIcon}>✓</Text>
                    </View>
                    <Text style={styles.modalTitle}>Concluir Tarefa</Text>
                    <Text style={styles.modalSubtitle}>
                      Tem certeza que deseja marcar esta tarefa como concluída?
                    </Text>
                  </View>

                  <View style={styles.taskPreviewCard}>
                    <View style={styles.previewHeader}>
                      <Text style={styles.previewTitle} numberOfLines={2}>
                        {task.title}
                      </Text>
                      <View style={[styles.previewPriorityBadge, { backgroundColor: priorityConfig.bg }]}>
                        <Text style={[styles.previewPriorityText, { color: priorityConfig.color }]}>
                          {priorityConfig.text}
                        </Text>
                      </View>
                    </View>

                    {task.dueDate && (
                      <View style={styles.previewDueDate}>
                        <Text style={styles.previewDueDateText}>
                          📅 Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={handleCompleteTask}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.confirmButtonText}>✓ Concluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  completedContainer: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.8,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  completedTitle: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  content: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  dueDateLabel: {
    fontSize: 12,
  },
  dueDateText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  actionSection: {
    alignItems: 'stretch',
  },
  completeButton: {
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  completedSection: {
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  completedIcon: {
    fontSize: 18,
    color: '#059669',
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width - 48,
    maxWidth: 420,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 28,
    color: '#059669',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  taskPreviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 22,
  },
  previewPriorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewPriorityText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  previewDueDate: {
    marginTop: 8,
  },
  previewDueDateText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});