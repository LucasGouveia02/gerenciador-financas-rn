import React, { useState } from 'react';
import { Modal, View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { styles } from './styles';

interface AddGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({ visible, onClose, onSubmit }) => {
  const [groupName, setGroupName] = useState('');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Novo Grupo</Text>
          <TextInput
            placeholder="Nome do Grupo"
            value={groupName}
            onChangeText={setGroupName}
            style={styles.input}
          />
          <Button
            title="Salvar"
            onPress={() => {
              onSubmit(groupName);
              setGroupName('');
              onClose();
            }}
          />
          <Button title="Cancelar" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};