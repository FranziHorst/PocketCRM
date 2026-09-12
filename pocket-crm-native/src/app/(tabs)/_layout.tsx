import { Tabs } from 'expo-router/tabs';
import { Home, LayoutDashboard, Users, MessageCircle, User } from 'lucide-react-native';

const PRIMARY = '#4F46E5';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: PRIMARY },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="contacts"
        options={{ title: 'Contacts', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="ai"
        options={{ title: 'AI Copilot', tabBarLabel: 'AI', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
