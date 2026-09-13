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
        sceneStyle: { backgroundColor: c.bg },
        tabBarActiveTintColor: c.accentDark,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: c.accentDark, color: c.onDark, fontSize: 10, fontWeight: '700' },
        }}
      />
      <Tabs.Screen name="contacts" options={{ title: 'Contacts', headerShown: false, tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tabs.Screen name="aichat" options={{ title: 'AI Assistant', tabBarIcon: ({ color, size }) => <MessageSquareCode color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
