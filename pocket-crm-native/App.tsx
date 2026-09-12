import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Briefcase, MessageCircle, User } from 'lucide-react-native';

import { UserProfile, Contact, DailyTask, AppNotification } from './types';
import { initialUserProfile, initialContacts, initialDailyTasks, initialNotifications } from './mockData';

import DashboardScreen from './screens/DashboardScreen';
import ContactsScreen from './screens/ContactsScreen';
import AIChatScreen from './screens/AIChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import TodayScreen from './screens/TodayScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#4F46E5',
  dark: '#1F2937',
  light: '#F9FAFB',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
};

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DashboardScreen"
        component={DashboardScreen}
      />
    </Stack.Navigator>
  );
}

function ContactsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ContactsList"
        component={ContactsScreen}
      />
    </Stack.Navigator>
  );
}

function AIChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
      />
    </Stack.Navigator>
  );
}

function AppTabs({ sharedProps }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen
        name="TodayTab"
        options={{
          title: 'Today',
          headerTitle: 'Today',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      >
        {() => <TodayScreen {...sharedProps} />}
      </Tab.Screen>

      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          title: 'Dashboard',
          headerTitle: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="ContactsTab"
        component={ContactsStack}
        options={{
          title: 'Contacts',
          headerTitle: 'Contacts',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="AIChatTab"
        component={AIChatStack}
        options={{
          title: 'AI',
          headerTitle: 'AI Copilot',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [tasks, setTasks] = useState<DailyTask[]>(initialDailyTasks);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [userProfile, contacts, tasks, notifications]);

  const loadData = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('pocket_crm_user_profile');
      const savedContacts = await AsyncStorage.getItem('pocket_crm_contacts');
      const savedTasks = await AsyncStorage.getItem('pocket_crm_tasks');
      const savedNotifications = await AsyncStorage.getItem('pocket_crm_notifications');

      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      if (savedContacts) setContacts(JSON.parse(savedContacts));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('pocket_crm_user_profile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('pocket_crm_contacts', JSON.stringify(contacts));
      await AsyncStorage.setItem('pocket_crm_tasks', JSON.stringify(tasks));
      await AsyncStorage.setItem('pocket_crm_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const sharedProps = {
    userProfile,
    setUserProfile,
    contacts,
    setContacts,
    tasks,
    setTasks,
    notifications,
    setNotifications,
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppTabs sharedProps={sharedProps} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
