import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './pages/HomeScreen';
import AuthScreen from './pages/AuthScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}