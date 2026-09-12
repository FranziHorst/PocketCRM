import { Tabs } from 'expo-router';
import { LayoutDashboard, MessageSquareCode, User, Users } from 'lucide-react-native';
import { AppHeader } from '@/components/AppHeader';
import { useCrm } from '@/store';
import { c } from '@/theme';

export default function TabsLayout() {
  const { pendingCount } = useCrm();

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: c.slate50 },
        tabBarActiveTintColor: c.indigo600,
        tabBarInactiveTintColor: c.slate600,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: { backgroundColor: c.white, borderTopColor: c.slate200 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: c.rose500, color: c.white, fontSize: 10, fontWeight: '700' },
        }}
      />
      <Tabs.Screen name="contacts" options={{ title: 'Contacts', headerShown: false, tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tabs.Screen name="aichat" options={{ title: 'AI Copilot', tabBarIcon: ({ color, size }) => <MessageSquareCode color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
