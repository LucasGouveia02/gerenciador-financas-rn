import React, { useState } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { styles } from './styles';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../routes';

type ExpensesListRouteProp = RouteProp<RootStackParamList, 'ExpensesList'>;

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
}

const ExpensesListScreen: React.FC = () => {
  const route = useRoute<ExpensesListRouteProp>();
  const { expenses } = route.params;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredExpenses = expenses.filter((exp: { date: string | number | Date; }) => {
    const expDate = new Date(exp.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || expDate >= start) && (!end || expDate <= end);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtrar por data</Text>
      <TextInput
        placeholder="Data início (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        style={styles.input}
      />
      <TextInput
        placeholder="Data fim (YYYY-MM-DD)"
        value={endDate}
        onChangeText={setEndDate}
        style={styles.input}
      />
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseRow}>
            <Text>{item.category}</Text>
            <Text>R$ {item.amount.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ExpensesListScreen;
