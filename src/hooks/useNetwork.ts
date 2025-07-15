import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  getDBConnection,
  getUnsyncedTasks,
  markTaskAsSynced,
} from '../database/taskRepository';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export function useNetworkSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(!!online);
      if (online) {
        syncPendingTasks();
      }
    });

    return () => unsubscribe();
  }, []);

  const syncPendingTasks = async () => {
    try {
      const db = await getDBConnection();
      const unsyncedTasks = await getUnsyncedTasks(db);

      if (!unsyncedTasks || unsyncedTasks.length === 0) return;

      for (const task of unsyncedTasks) {
        const payload = {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
        };

        await api.post('/tasks', payload);
        await markTaskAsSynced(db, task.id);
      }

      Toast.show({
        type: 'success',
        text1: 'Sincronização concluída',
        text2: `${unsyncedTasks.length} tarefas sincronizadas`,
      });
    } catch (error) {
      console.error('Erro ao sincronizar tarefas:', error);
    }
  };

  return { isOnline, syncPendingTasks };
}
