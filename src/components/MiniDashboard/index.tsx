import React from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { styles } from './styles';

interface CategorySummary {
  category: string;
  amount: number;
}

interface MiniDashboardProps {
  summaries: CategorySummary[];
  total: number;
}

const screenWidth = Dimensions.get('window').width;

export const MiniDashboard: React.FC<MiniDashboardProps> = ({ summaries, total }) => {
  const colors = [
    '#E63946', '#1D3557', '#2A9D8F', '#000000', '#F4A261',
    '#E76F51', '#A8DADC', '#457B9D', '#F72585', '#B5179E',
    '#7209B7', '#560BAD', '#480CA8', '#3A0CA3', '#3F37C9',
    '#4361EE', '#4895EF', '#4CC9F0', '#FFB703', '#FB8500',
    '#219EBC', '#023047', '#8ECAE6', '#FF006E', '#8338EC',
    '#3A86FF', '#FFBE0B', '#FB5607', '#FF006E', '#8338EC'
  ];


  const sortedSummaries = [...summaries].sort((a, b) => b.amount - a.amount);

  const pieData = sortedSummaries.map((item, index) => {
    const percentage = ((item.amount / total) * 100).toFixed(1);

    return {
      name: `(${item.amount.toFixed(2)})`,
      amount: item.amount,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    };
  });

  return (
    <View style={[styles.card, { paddingRight: 20 }]}>
      <Text style={styles.title}>Resumo por categoria</Text>

      <PieChart
        data={pieData}
        width={screenWidth - 80}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Grupos:</Text>
      </View>


      <FlatList
        data={sortedSummaries}
        keyExtractor={(item, index) => item.category + index}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.amountText}>R$ {item.amount.toFixed(2)}</Text>
          </View>
        )}
        style={{ maxHeight: 150 }}
        nestedScrollEnabled={true}
      />


      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalText}>
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>
    </View>
  );
};
