import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface HomeActionsProps {
  onAddExpense: () => void;
  onAddGroup: () => void;
  onViewExpenses: () => void;
}

export const HomeActions: React.FC<HomeActionsProps> = ({
  onAddExpense,
  onAddGroup,
  onViewExpenses,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ações</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={onAddExpense}>
          <Text style={styles.buttonText}>+ Despesa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddGroup}>
          <Text style={styles.buttonText}>+ Grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onViewExpenses}>
          <Text style={styles.buttonText}>Ver despesas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
