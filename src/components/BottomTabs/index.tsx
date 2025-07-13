import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Icon from 'react-native-vector-icons/Ionicons';
import Tasks from '../../screens/Tasks';
import Profile from '../../screens/Profile';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Tasks"
        component={Tasks}
        options={{
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="list" color={color} size={size} />
          // ),
          tabBarLabel: 'Listagem',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="person" color={color} size={size} />
          // ),
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}
