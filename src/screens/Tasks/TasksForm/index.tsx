import React from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { TasksTypes } from '../../../types/task';
import Header from '../../../components/Header';
import { TaskForm } from '../../../components/TasksForm';

export default function TaskFormScreen() {
  const route = useRoute();
  const task = (route.params as { task?: TasksTypes })?.task;

  return (
    <View style={{ flex: 1 }}>
      <Header title="Nova tarefa" showBackButton />

      <TaskForm initialData={task} />
    </View>
  );
}
