import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MessageSquare, Sparkles, Trash2 } from 'lucide-react-native';
import { useCrm } from '@/store';
import { Contact } from '../../../../types';
import { c, t, font } from '@/theme';
import { Avatar, Btn, confirmAsync } from '@/components/ui';
import { ContactDetails } from '@/components/ContactDetails';
import { ContactFields } from '@/components/ContactFields';

export default function ContactPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, saveContact, deleteContact, askAIForContact, askIceBreakerFor } = useCrm();
  const router = useRouter();
  const contact = contacts.find((ct) => ct.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Contact | null>(null);

  if (!contact) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Stack.Screen options={{ title: 'Contact' }} />
        <Text style={{ fontSize: 13, color: c.textSecondary , fontFamily: font.regular}}>This contact no longer exists.</Text>
      </View>
    );
  }

  const startEdit = () => { setForm({ ...contact, socialLinks: { ...contact.socialLinks } }); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setForm(null); };
  const done = () => { if (form && form.name.trim()) { saveContact(form); } setEditing(false); setForm(null); };
  const remove = async () => {
    if (await confirmAsync(`Remove ${contact.name} from your contacts?`)) { deleteContact(contact.id); router.back(); }
  };

  const HeaderBtn = ({ label, onPress, bold }: { label: string; onPress: () => void; bold?: boolean }) => (
    <Pressable onPress={onPress} hitSlop={8} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
      <Text style={{ fontSize: 16, fontFamily: bold ? font.display : font.medium, color: c.accentDark }}>{label}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: editing ? 'Edit contact' : '',
          headerBackVisible: !editing,
          headerLeft: editing ? () => <HeaderBtn label="Cancel" onPress={cancelEdit} /> : undefined,
          headerRight: () => (editing
            ? <HeaderBtn label="Done" onPress={done} bold />
            : <HeaderBtn label="Edit" onPress={startEdit} />),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 22 }} keyboardShouldPersistTaps="handled">
        {editing && form ? (
          <ContactFields form={form} setForm={setForm} />
        ) : (
          <>
            <View style={{ alignItems: 'center', gap: 6, paddingTop: 4, paddingBottom: 8 }}>
              <Avatar name={contact.name} color={contact.avatarColor} size={88} radius={28} />
              <Text style={{ fontSize: 24, fontFamily: font.display, letterSpacing: -0.3, color: c.text, textAlign: 'center', marginTop: 6 }}>{contact.name}</Text>
              {(contact.role || contact.company) ? (
                <Text style={[t.secondary, { textAlign: 'center' }]}>{[contact.role, contact.company].filter(Boolean).join(' at ')}</Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Btn label="Ice breaker" icon={<Sparkles size={15} color={c.onDark} />} onPress={() => askIceBreakerFor(contact)} />
                <Btn label="Ask AI" variant="soft" icon={<MessageSquare size={15} color={c.accentDark} />} onPress={() => askAIForContact(contact)} />
              </View>
            </View>

            <ContactDetails contact={contact} />

            <Pressable onPress={remove} style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }}>
              <Trash2 size={14} color={c.danger} />
              <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.danger }}>Delete contact</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
