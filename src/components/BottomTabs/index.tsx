import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { List, User } from 'lucide-react-native';
import Tasks from '../../screens/Tasks';
import Profile from '../../screens/Profile';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={Tasks}
        options={{
          tabBarLabel: 'Tarefas',
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
