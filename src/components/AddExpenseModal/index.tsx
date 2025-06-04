import React, { useState } from 'react';
import { Modal, View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { styles } from './styles';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;       // ex: "2025-06-03" (formato AAAA-MM-DD)
    description: string; // Mapeia para 'DescricaoGasto'
    category: string;    // Mapeia para 'CategoriaGasto'
    amount: number;      // Mapeia para 'ValorGasto'
    name?: string;
  }) => void;
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
              onSubmit({
                name, amount: parseFloat(amount),
                date: '',
                description: '',
                category: ''
              });
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