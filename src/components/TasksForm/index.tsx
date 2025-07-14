import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Platform,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import api from '../../services/api.tsx';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TasksTypes, TaskPriority, TaskStatus } from '../../types/Task.ts';
import RNPickerSelect from 'react-native-picker-select';

type Props = {
  initialData?: TasksTypes;
  onSuccess?: () => void;
};

type FormData = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export default function TaskForm({ initialData, onSuccess }: Props) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? TaskStatus.PENDING,
      priority: initialData?.priority ?? TaskPriority.MEDIUM,
      dueDate: initialData?.dueDate ?? null,
    },
  });

  const dueDate = watch('dueDate');
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const onSubmit: SubmitHandler<FormData> = async data => {
    if (!data.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Título obrigatório',
      });
      return;
    }

    try {
      if (initialData) {
        await api.patch(`/tasks/${initialData.id}`, data);
        Toast.show({
          type: 'success',
          text1: 'Tarefa atualizada com sucesso',
        });
      } else {
        await api.post('/tasks', data);
        Toast.show({
          type: 'success',
          text1: 'Tarefa criada com sucesso',
        });
      }
      onSuccess?.();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar tarefa',
        text2: 'Verifique os dados e tente novamente.',
      });
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setValue('dueDate', selectedDate.toISOString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Título *</Text>
      <Controller
        name="title"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, !value?.trim() && styles.inputError]}
            placeholder="Título da tarefa"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Text style={styles.label}>Descrição</Text>
      <Controller
        name="description"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Text style={styles.label}>Status</Text>
      <Controller
        name="status"
        control={control}
        render={({ field: { onChange, value } }) => (
          <RNPickerSelect
            onValueChange={onChange}
            value={value}
            placeholder={{ label: 'Selecione o status', value: null }}
            items={[
              { label: 'Pendente', value: TaskStatus.PENDING },
              { label: 'Em andamento', value: TaskStatus.IN_PROGRESS },
              { label: 'Concluída', value: TaskStatus.COMPLETED },
              { label: 'Cancelada', value: TaskStatus.CANCELED },
            ]}
            style={pickerSelectStyles}
          />
        )}
      />

      <Text style={styles.label}>Prioridade</Text>
      <Controller
        name="priority"
        control={control}
        render={({ field: { onChange, value } }) => (
          <RNPickerSelect
            onValueChange={onChange}
            value={value}
            placeholder={{ label: 'Selecione a prioridade', value: null }}
            items={[
              { label: 'Baixa', value: TaskPriority.LOW },
              { label: 'Média', value: TaskPriority.MEDIUM },
              { label: 'Alta', value: TaskPriority.HIGH },
            ]}
            style={pickerSelectStyles}
          />
        )}
      />

      <Text style={styles.label}>Prazo</Text>
      <Button title="Selecionar data" onPress={() => setShowDatePicker(true)} />
      {dueDate && (
        <Text style={{ marginTop: 5 }}>
          {new Date(dueDate).toLocaleDateString()}
        </Text>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={dueDate ? new Date(dueDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title={initialData ? 'Atualizar Tarefa' : 'Criar Tarefa'}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginTop: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
});
