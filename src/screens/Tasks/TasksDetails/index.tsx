import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  Pencil,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react-native';
import Header from '../../../components/Header';
import api from '../../../services/api';
import { TaskStatus, TasksTypes } from '../../../types/Task';
import {
  getDBConnection,
  getTaskById,
  updateTask,
} from '../../../database/taskRepository';
import { useNetworkSync } from '../../../hooks/useNetwork';

type RouteParams = {
  TaskDetails: { id: string };
};

export default function TaskDetails() {
  const route = useRoute<RouteProp<RouteParams, 'TaskDetails'>>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [task, setTask] = useState<TasksTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkSync();

  useEffect(() => {
    async function loadTask() {
      try {
        if (isOnline) {
          const response = await api.get(`/tasks/${id}`);
          setTask(response.data);
        } else {
          const db = await getDBConnection();
          const localTask = await getTaskById(db, id);
          if (localTask) {
            setTask(localTask as TasksTypes);
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar tarefa:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [id, isOnline]);

  const handleEdit = () => {
    if (task) {
      navigation.navigate('TaskForm' as never, { task } as never);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Excluir Tarefa',
      'Esta ação não pode ser desfeita. Tem certeza que deseja excluir esta tarefa?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
      { cancelable: true },
    );
  };

  const handleDelete = async () => {
    try {
      if (isOnline) {
        await api.delete(`/tasks/${id}`);
        const db = await getDBConnection();
        await updateTask(db, id, { status: TaskStatus.CANCELED, isSynced: 1 });
      } else {
        const db = await getDBConnection();
        await updateTask(db, id, {
          status: TaskStatus.CANCELED,
          isSynced: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível excluir a tarefa. Tente novamente.',
      );
    }
  };

  const getPriorityConfig = () => {
    if (!task)
      return {
        color: '#6B7280',
        bg: '#F9FAFB',
        text: 'Indefinida',
        icon: Circle,
      };

    switch (task.priority) {
      case 'HIGH':
        return {
          color: '#DC2626',
          bg: '#FEF2F2',
          text: 'Alta',
          icon: AlertCircle,
        };
      case 'MEDIUM':
        return {
          color: '#D97706',
          bg: '#FFFBEB',
          text: 'Média',
          icon: Circle,
        };
      case 'LOW':
        return {
          color: '#2563EB',
          bg: '#EFF6FF',
          text: 'Baixa',
          icon: Circle,
        };
      default:
        return {
          color: '#6B7280',
          bg: '#F9FAFB',
          text: task.priority,
          icon: Circle,
        };
    }
  };

  const getStatusConfig = () => {
    if (!task)
      return {
        color: '#6B7280',
        bg: '#F9FAFB',
        text: 'Indefinido',
        icon: Circle,
      };

    switch (task.status) {
      case TaskStatus.COMPLETED:
        return {
          color: '#059669',
          bg: '#ECFDF5',
          text: 'Concluída',
          icon: CheckCircle2,
        };
      case TaskStatus.IN_PROGRESS:
        return {
          color: '#D97706',
          bg: '#FFFBEB',
          text: 'Em Andamento',
          icon: Clock,
        };
      case TaskStatus.PENDING:
        return {
          color: '#6B7280',
          bg: '#F9FAFB',
          text: 'Pendente',
          icon: Circle,
        };
      default:
        return {
          color: '#6B7280',
          bg: '#F9FAFB',
          text: task.status,
          icon: Circle,
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando tarefa...</Text>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <AlertCircle size={48} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Tarefa não encontrada</Text>
          <Text style={styles.errorDescription}>
            A tarefa que você está procurando não existe ou foi removida.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.errorButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const priorityConfig = getPriorityConfig();
  const statusConfig = getStatusConfig();
  const PriorityIcon = priorityConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <View style={styles.container}>
      <Header
        title="Detalhes da Tarefa"
        description={isOnline ? '🟢 Online' : '🔴 Offline'}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Pencil size={18} color="#3B82F6" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmDelete}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCard}>
          <Text style={styles.title}>{task.title}</Text>

          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : (
            <Text style={styles.noDescription}>
              Nenhuma descrição fornecida
            </Text>
          )}
        </View>

        <View style={styles.badgesContainer}>
          <View
            style={[styles.badgeCard, { backgroundColor: statusConfig.bg }]}
          >
            <View style={styles.badgeHeader}>
              <StatusIcon size={20} color={statusConfig.color} />
              <Text style={styles.badgeLabel}>Status</Text>
            </View>
            <Text style={[styles.badgeValue, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>

          <View
            style={[styles.badgeCard, { backgroundColor: priorityConfig.bg }]}
          >
            <View style={styles.badgeHeader}>
              <PriorityIcon size={20} color={priorityConfig.color} />
              <Text style={styles.badgeLabel}>Prioridade</Text>
            </View>
            <Text style={[styles.badgeValue, { color: priorityConfig.color }]}>
              {priorityConfig.text}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Informações da Tarefa</Text>

          <View style={styles.detailsContent}>
            {task.dueDate && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Calendar size={20} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Prazo</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(task.dueDate)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Clock size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Criada em</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(task.createdAt)}
                </Text>
              </View>
            </View>

            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Clock size={20} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Última atualização</Text>
                  <Text style={styles.detailValue}>
                    {formatDateTime(task.updatedAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.syncCard}>
          <View style={styles.syncHeader}>
            <View
              style={[
                styles.syncIndicator,
                { backgroundColor: isOnline ? '#10B981' : '#F59E0B' },
              ]}
            />
            <Text style={styles.syncText}>
              {isOnline ? 'Sincronizado com o servidor' : 'Disponível offline'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  errorDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 24,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    letterSpacing: 0.2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: 0.2,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    letterSpacing: 0.1,
  },
  noDescription: {
    fontSize: 16,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  badgeCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.2,
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
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
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  detailsContent: {
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    lineHeight: 22,
  },
  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.1,
  },
});
