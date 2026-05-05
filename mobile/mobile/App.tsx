import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { Login } from './src/screens/Login';
import { Home } from './src/screens/Home';
import { AIAssistant } from './src/screens/AIAssistant';
import { Category, Product } from './src/screens/Category';
import { ItemDetail } from './src/screens/ItemDetail';
import { PCBuild } from './src/screens/PCBuild';
import { Cart } from './src/screens/Cart';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AIAssistant: undefined;
  Category: { categoryName: string };
  ItemDetail: { product: Product };
  PCBuild: undefined;
  Cart: undefined;
  Checkout: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#121212' },
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="AIAssistant" component={AIAssistant} />
          <Stack.Screen name="Category" component={Category} />
          <Stack.Screen name="ItemDetail" component={ItemDetail} />
          <Stack.Screen name="PCBuild" component={PCBuild} />
          <Stack.Screen name="Cart" component={Cart} />
          {/* Checkout: próxima etapa */}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}