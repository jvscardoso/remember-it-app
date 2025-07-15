import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TaskPriority, TaskStatus } from '../../types/Task';
import { COLORS } from '../../theme/palette';
import api from '../../services/api.tsx';

const { width } = Dimensions.get('window');

type Props = {
  initialData?: {
    id: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormData = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
};

const PRIORITY_COLORS = {
  [TaskPriority.LOW]: COLORS.success,
  [TaskPriority.MEDIUM]: COLORS.warning,
  [TaskPriority.HIGH]: COLORS.error,
};

const STATUS_COLORS = {
  [TaskStatus.PENDING]: COLORS.warning,
  [TaskStatus.IN_PROGRESS]: COLORS.primary,
  [TaskStatus.COMPLETED]: COLORS.success,
  [TaskStatus.CANCELED]: COLORS.error,
};

const STATUS_LABELS = {
  [TaskStatus.PENDING]: 'Pendente',
  [TaskStatus.IN_PROGRESS]: 'Em andamento',
  [TaskStatus.COMPLETED]: 'Concluída',
  [TaskStatus.CANCELED]: 'Cancelada',
};

const PRIORITY_LABELS = {
  [TaskPriority.LOW]: 'Baixa',
  [TaskPriority.MEDIUM]: 'Média',
  [TaskPriority.HIGH]: 'Alta',
};

export function TaskForm({ initialData, onSuccess, onCancel }: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? TaskStatus.PENDING,
      priority: initialData?.priority ?? TaskPriority.MEDIUM,
      dueDate: initialData?.dueDate ?? null,
    },
  });

  const watchedValues = watch();

  const validateForm = useCallback((data: FormData) => {
    const errors: Partial<FormData> = {};

    if (!data.title?.trim()) {
      errors.title = 'Título é obrigatório';
    } else if (data.title.trim().length < 3) {
      errors.title = 'Título deve ter pelo menos 3 caracteres';
    }

    if (data.description && data.description.length > 500) {
      errors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    return errors;
  }, []);

  const onSubmit: SubmitHandler<FormData> = async data => {
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      Alert.alert(
        'Erro de validação',
        Object.values(validationErrors)[0] as string,
      );
      return;
    }

    try {
      if (initialData?.id) {
        await api.patch(`/tasks/${initialData.id}`, data);
      } else {
        await api.post('/tasks', data);
      }

      Alert.alert(
        'Sucesso',
        initialData
          ? 'Tarefa atualizada com sucesso!'
          : 'Tarefa criada com sucesso!',
        [{ text: 'OK', onPress: onSuccess }],
      );
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao salvar a tarefa. Tente novamente.',
        [{ text: 'OK' }],
      );
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

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Nenhuma data selecionada';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: Array<{ label: string; value: any; color?: string }>,
    onSelect: (value: any) => void,
    currentValue: any,
  ) => {
    if (!visible) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.modalOption,
                currentValue === option.value && styles.modalOptionSelected,
              ]}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
            >
              {option.color && (
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: option.color },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.modalOptionText,
                  currentValue === option.value &&
                    styles.modalOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {initialData
            ? 'Atualize as informações da tarefa'
            : 'Preencha os dados para criar uma nova tarefa'}
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Título <Text style={styles.required}>*</Text>
        </Text>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Título é obrigatório' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  focusedField === 'title' && styles.textInputFocused,
                  errors.title && styles.textInputError,
                ]}
                placeholder="Digite o título da tarefa"
                placeholderTextColor={COLORS.gray400}
                value={value}
                onChangeText={onChange}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                maxLength={100}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title.message}</Text>
              )}
              <Text style={styles.charCount}>{value?.length || 0}/100</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Descrição</Text>
        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                style={[
                  styles.textArea,
                  focusedField === 'description' && styles.textInputFocused,
                  errors.description && styles.textInputError,
                ]}
                placeholder="Adicione detalhes sobre a tarefa (opcional)"
                placeholderTextColor={COLORS.gray400}
                value={value || ''}
                onChangeText={onChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={styles.errorText}>
                  {errors.description.message}
                </Text>
              )}
              <Text style={styles.charCount}>{(value || '').length}/500</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={styles.halfFieldContainer}>
          <Text style={styles.fieldLabel}>Status</Text>
          <Controller
            name="status"
            control={control}
            render={({ field: { value } }) => (
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  { borderColor: STATUS_COLORS[value] },
                ]}
                onPress={() => setShowStatusPicker(true)}
              >
                <View style={styles.selectButtonContent}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: STATUS_COLORS[value] },
                    ]}
                  />
                  <Text style={styles.selectButtonText}>
                    {STATUS_LABELS[value]}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.halfFieldContainer}>
          <Text style={styles.fieldLabel}>Prioridade</Text>
          <Controller
            name="priority"
            control={control}
            render={({ field: { value } }) => (
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  { borderColor: PRIORITY_COLORS[value] },
                ]}
                onPress={() => setShowPriorityPicker(true)}
              >
                <View style={styles.selectButtonContent}>
                  <View
                    style={[
                      styles.priorityIndicator,
                      { backgroundColor: PRIORITY_COLORS[value] },
                    ]}
                  />
                  <Text style={styles.selectButtonText}>
                    {PRIORITY_LABELS[value]}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Data de Vencimento</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.dateButtonContent}>
            <Text style={styles.dateIcon}>📅</Text>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateButtonText}>
                {formatDate(watchedValues.dueDate)}
              </Text>
              {watchedValues.dueDate && (
                <Text style={styles.dateButtonSubtext}>Toque para alterar</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        {watchedValues.dueDate && (
          <TouchableOpacity
            style={styles.clearDateButton}
            onPress={() => setValue('dueDate', null)}
          >
            <Text style={styles.clearDateText}>Remover data</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isSubmitting && styles.primaryButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <View style={styles.buttonContent}>
            {isSubmitting && (
              <ActivityIndicator
                size="small"
                color={COLORS.white}
                style={styles.loadingIndicator}
              />
            )}
            <Text
              style={[
                styles.primaryButtonText,
                isSubmitting && styles.primaryButtonTextDisabled,
              ]}
            >
              {isSubmitting
                ? 'Salvando...'
                : initialData
                ? 'Atualizar Tarefa'
                : 'Criar Tarefa'}
            </Text>
          </View>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={
            watchedValues.dueDate ? new Date(watchedValues.dueDate) : new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {renderPickerModal(
        showStatusPicker,
        () => setShowStatusPicker(false),
        'Selecionar Status',
        Object.values(TaskStatus).map(status => ({
          label: STATUS_LABELS[status],
          value: status,
          color: STATUS_COLORS[status],
        })),
        value => setValue('status', value),
        watchedValues.status,
      )}

      {renderPickerModal(
        showPriorityPicker,
        () => setShowPriorityPicker(false),
        'Selecionar Prioridade',
        Object.values(TaskPriority).map(priority => ({
          label: PRIORITY_LABELS[priority],
          value: priority,
          color: PRIORITY_COLORS[priority],
        })),
        value => setValue('priority', value),
        watchedValues.priority,
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  header: {
    marginBottom: 32,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 8,
  },

  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    lineHeight: 24,
  },

  fieldContainer: {
    marginBottom: 24,
  },

  halfFieldContainer: {
    flex: 1,
    marginRight: 8,
  },

  rowContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },

  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },

  required: {
    color: COLORS.error,
    fontSize: 16,
  },

  textInput: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    color: COLORS.gray900,
    minHeight: 52,
  },

  textInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FEFEFE',
  },

  textInputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },

  textArea: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    color: COLORS.gray900,
    minHeight: 100,
    maxHeight: 150,
  },

  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: 4,
  },

  charCount: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'right',
    marginTop: 4,
  },

  selectButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: COLORS.white,
    minHeight: 52,
  },

  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectButtonText: {
    fontSize: 16,
    color: COLORS.gray700,
    marginLeft: 12,
  },

  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  priorityIndicator: {
    width: 8,
    height: 16,
    borderRadius: 4,
  },

  dateButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    minHeight: 68,
  },

  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    fontSize: 24,
    marginRight: 16,
  },

  dateTextContainer: {
    flex: 1,
  },

  dateButtonText: {
    fontSize: 16,
    color: COLORS.gray700,
    fontWeight: '500',
  },

  dateButtonSubtext: {
    fontSize: 12,
    color: COLORS.gray400,
    marginTop: 2,
  },

  clearDateButton: {
    padding: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  clearDateText: {
    fontSize: 14,
    color: COLORS.error,
    textDecorationLine: 'underline',
  },

  actionContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingBottom: 40,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 56,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  primaryButtonDisabled: {
    backgroundColor: COLORS.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingIndicator: {
    marginRight: 12,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },

  primaryButtonTextDisabled: {
    color: COLORS.gray100,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    minHeight: 56,
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray600,
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: width - 48,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 20,
    textAlign: 'center',
  },

  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.gray50,
  },

  modalOptionSelected: {
    backgroundColor: COLORS.primary,
  },

  modalOptionText: {
    fontSize: 16,
    color: COLORS.gray700,
    marginLeft: 12,
  },

  modalOptionTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },

  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  modalCancelButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
  },

  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray600,
    textAlign: 'center',
  },
});
