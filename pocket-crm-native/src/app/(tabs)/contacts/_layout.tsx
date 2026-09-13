import { Stack } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { c } from '@/theme';

export default function ContactsStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.accent,
        headerTitleStyle: { color: c.text, fontWeight: '700', fontSize: 15 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: c.bg },
      }}>
      <Stack.Screen name="index" options={{ header: () => <AppHeader /> }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
