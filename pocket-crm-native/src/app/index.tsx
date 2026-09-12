import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OpeningPageView } from '@/components/OpeningPageView';
import { c } from '@/theme';

export default function OpeningPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.slate50 }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <OpeningPageView />
      </ScrollView>
    </SafeAreaView>
  );
}
