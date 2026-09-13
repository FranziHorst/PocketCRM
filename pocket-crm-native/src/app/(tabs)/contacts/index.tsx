import { Pressable, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { ContactsView } from '@/components/ContactsView';
import { useCrm } from '@/store';
import { c } from '@/theme';
import { Screen } from '@/components/ui';

export default function Contacts() {
  const { openAddContact } = useCrm();
  return (
    <View style={{ flex: 1 }}>
      <Screen bottomInset={100}>
        <ContactsView />
      </Screen>
      <Pressable
        onPress={() => openAddContact()}
        accessibilityLabel="Add contact"
        style={({ pressed }) => ({
          position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
          backgroundColor: pressed ? c.accentDeep : c.accentDark, alignItems: 'center', justifyContent: 'center',
          shadowColor: c.accentDeep, shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
        })}>
        <Plus size={26} color={c.onDark} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
