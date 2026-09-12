import { ScrollView } from 'react-native';
import { ContactsView } from '@/components/ContactsView';

export default function Contacts() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <ContactsView />
    </ScrollView>
  );
}
