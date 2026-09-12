import { Stack } from 'expo-router';
import { CrmProvider } from '@/store';

export default function RootLayout() {
  return (
    <CrmProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CrmProvider>
  );
}
