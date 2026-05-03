import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { Login } from './src/screens/Login';
import { Home } from './src/screens/Home';
import { AIAssistant } from './src/screens/AIAssistant';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AIAssistant: undefined;
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
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}