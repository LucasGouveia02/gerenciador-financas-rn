import React, { useState } from 'react';
import { Modal, View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { styles } from './styles';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; amount: number }) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Novo Gasto</Text>
          <TextInput
            placeholder="Descrição"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Valor"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />
          <Button
            title="Salvar"
            onPress={() => {
              onSubmit({ name, amount: parseFloat(amount) });
              setName('');
              setAmount('');
              onClose();
            }}
          />
          <Button title="Cancelar" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};