import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './pages/HomeScreen';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
}

export type RootStackParamList = {
  Home: undefined;
  ExpensesList: { expenses: Expense[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
  );
}
