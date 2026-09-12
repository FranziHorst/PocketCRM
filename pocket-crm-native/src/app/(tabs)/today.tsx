import { ScrollView } from 'react-native';
import { OpeningPageView } from '@/components/OpeningPageView';

export default function Today() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <OpeningPageView embedded />
    </ScrollView>
  );
}
