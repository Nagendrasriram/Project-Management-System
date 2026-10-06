import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { TaskFormScreen } from '../screens/TaskFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.projectName || 'Project Details',
          headerBackTitle: 'Back',
          headerTintColor: '#4f46e5',
        })}
      />
      <Stack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.task ? 'Edit Task' : 'New Task',
          presentation: 'modal',
          headerTintColor: '#4f46e5',
        })}
      />
    </Stack.Navigator>
  );
};
