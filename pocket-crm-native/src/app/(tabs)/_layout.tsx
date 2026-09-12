import { Tabs, useRouter } from 'expo-router';
import { CalendarCheck, LayoutDashboard, MessageSquareCode, User, Users } from 'lucide-react-native';
import { AppHeader } from '@/components/AppHeader';
import { useCrm } from '@/store';
import { c } from '@/theme';

export const unstable_settings = { initialRouteName: 'dashboard' };

export default function TabsLayout() {
  const router = useRouter();
  const { overdueCount } = useCrm();

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
        name="today"
        options={{ title: 'Today', tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} /> }}
        listeners={{ tabPress: (e) => { e.preventDefault(); router.replace('/'); } }}
      />
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          tabBarBadge: overdueCount > 0 ? overdueCount : undefined,
          tabBarBadgeStyle: { backgroundColor: c.rose500, color: c.white, fontSize: 10, fontWeight: '700' },
        }}
      />
      <Tabs.Screen name="aichat" options={{ title: 'AI Copilot', tabBarIcon: ({ color, size }) => <MessageSquareCode color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
