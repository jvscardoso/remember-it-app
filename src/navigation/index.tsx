import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login';
import { ActivityIndicator, View } from 'react-native';
import BottomTabNavigator from '../components/BottomTabs';
import { useAuth } from '../hooks/useAuth.tsx';
import RegisterScreen from '../screens/Register';
import TaskDetails from '../screens/Tasks/TasksDetails';
import TaskFormScreen from '../screens/Tasks/TasksForm';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="TaskDetails" component={TaskDetails} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
