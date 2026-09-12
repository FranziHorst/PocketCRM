import { Pressable, ScrollView, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { ContactsView } from '@/components/ContactsView';
import { useCrm } from '@/store';
import { c } from '@/theme';

export default function Contacts() {
  const { openAddContact } = useCrm();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }} keyboardShouldPersistTaps="handled">
        <ContactsView />
      </ScrollView>
      <Pressable
        onPress={() => openAddContact()}
        accessibilityLabel="Add contact"
        style={({ pressed }) => ({
          position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
          backgroundColor: pressed ? c.indigo700 : c.indigo600, alignItems: 'center', justifyContent: 'center',
          shadowColor: c.indigo900, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
        })}>
        <Plus size={26} color={c.white} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
