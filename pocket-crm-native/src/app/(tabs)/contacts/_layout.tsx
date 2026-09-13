import { Stack } from 'expo-router';
import { c, font } from '@/theme';

// Wird ein Kontakt direkt geoeffnet (z.B. nach Speak to AI vom Home-Tab aus), liegt
// sonst nur die Detailseite im Stack: kein Zurueck-Pfeil, und der Contacts-Tab zeigt
// statt der Liste weiter diesen einen Kontakt. So liegt die Liste immer darunter.
export const unstable_settings = { initialRouteName: 'index' };

export default function ContactsStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.accent,
        headerTitleStyle: { color: c.text, fontFamily: font.display, fontSize: 16 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: c.bg },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
