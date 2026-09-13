import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { CrmProvider } from '@/store';
import { Modals } from '@/components/Modals';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Satoshi-Regular': require('../../assets/fonts/Satoshi-Regular.ttf'),
    'Satoshi-Medium': require('../../assets/fonts/Satoshi-Medium.ttf'),
    'Satoshi-Bold': require('../../assets/fonts/Satoshi-Bold.ttf'),
    'Satoshi-Black': require('../../assets/fonts/Satoshi-Black.ttf'),
  });
  if (!fontsLoaded) return null;
  return (
    <CrmProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <Modals />
    </CrmProvider>
  );
}
