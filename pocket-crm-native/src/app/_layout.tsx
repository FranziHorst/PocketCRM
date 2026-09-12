import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CrmProvider } from '@/store';
import { Modals } from '@/components/Modals';

export default function RootLayout() {
  return (
    <CrmProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <Modals />
    </CrmProvider>
  );
}
