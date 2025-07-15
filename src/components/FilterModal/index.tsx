import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import { TaskStatus } from '../../types/Task';

interface FilterModalProps {
  visible: boolean;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onClose: () => void;
}

const statusOptions = [
  { value: 'ALL', label: 'Todas' },
  { value: TaskStatus.PENDING, label: 'Pendentes' },
  { value: TaskStatus.IN_PROGRESS, label: 'Em Progresso' },
  { value: TaskStatus.COMPLETED, label: 'Concluídas' },
];

const FilterModal: React.FC<FilterModalProps> = ({
                                                   visible,
                                                   selectedStatus,
                                                   onStatusChange,
                                                   onClose
                                                 }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.PENDING:
        return '#8B5CF6';
      case TaskStatus.IN_PROGRESS:
        return '#3B82F6';
      case TaskStatus.COMPLETED:
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const handleStatusSelect = (status: string) => {
    onStatusChange(status);
    onClose();
  };

  const renderOption = ({ item }: { item: typeof statusOptions[0] }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        selectedStatus === item.value && styles.selectedOption
      ]}
      onPress={() => handleStatusSelect(item.value)}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(item.value) }
          ]}
        />
        <Text style={[
          styles.optionText,
          selectedStatus === item.value && styles.selectedOptionText
        ]}>
          {item.label}
        </Text>
      </View>
      {selectedStatus === item.value && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar Tarefas</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Selecione o status das tarefas:</Text>

          <FlatList
            data={statusOptions}
            keyExtractor={(item) => item.value}
            renderItem={renderOption}
            showsVerticalScrollIndicator={false}
            style={styles.optionsList}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: '#EEF2FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#4338CA',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#4338CA',
    fontWeight: '600',
  },
});

export default FilterModal;