import React from 'react';
import { Modal, View, Button, StyleSheet } from 'react-native';
import { styles } from './styles';

interface TaskOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
}

export const TaskOptionsModal: React.FC<TaskOptionsModalProps> = ({
  visible,
  onClose,
  onOptionSelect
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Button title="Adicionar gasto" onPress={() => onOptionSelect('addExpense')} />
          <Button title="Adicionar grupo" onPress={() => onOptionSelect('addGroup')} />
          <Button title="Visualizar gastos" onPress={() => onOptionSelect('viewExpenses')} />
          <Button title="Cancelar" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};