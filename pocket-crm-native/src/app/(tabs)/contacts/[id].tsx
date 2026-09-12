import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react-native';
import { useCrm } from '@/store';
import { Contact } from '../../../../types';
import { c, r } from '@/theme';
import { Avatar, Btn, confirmAsync } from '@/components/ui';
import { ContactDetails } from '@/components/ContactDetails';
import { ContactFields } from '@/components/ContactFields';

export default function ContactPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, saveContact, deleteContact, askAIForContact } = useCrm();
  const router = useRouter();
  const contact = contacts.find((ct) => ct.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Contact | null>(null);

  if (!contact) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Stack.Screen options={{ title: 'Contact' }} />
        <Text style={{ fontSize: 13, color: c.slate500 }}>This contact no longer exists.</Text>
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
      <Text style={{ fontSize: 15, fontWeight: bold ? '700' : '500', color: c.indigo600 }}>{label}</Text>
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
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 20 }} keyboardShouldPersistTaps="handled">
        {editing && form ? (
          <ContactFields form={form} setForm={setForm} />
        ) : (
          <>
            <View style={{ alignItems: 'center', gap: 8, paddingVertical: 8 }}>
              <Avatar name={contact.name} color={contact.avatarColor} size={72} radius={24} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: c.slate900, textAlign: 'center' }}>{contact.name}</Text>
              {(contact.role || contact.company) ? (
                <Text style={{ fontSize: 13, color: c.slate600, textAlign: 'center' }}>{[contact.role, contact.company].filter(Boolean).join(' • ')}</Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Btn label="Ask AI" variant="violet" icon={<MessageSquare size={14} color={c.violet700} />} onPress={() => askAIForContact(contact)} />
                <Btn label="Edit" variant="soft" icon={<Pencil size={14} color={c.indigo700} />} onPress={startEdit} />
              </View>
            </View>

            <View style={{ backgroundColor: c.white, borderRadius: r.xl, borderWidth: 1, borderColor: c.slate200, padding: 16 }}>
              <ContactDetails contact={contact} />
            </View>

            <Pressable onPress={remove} style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }}>
              <Trash2 size={14} color={c.rose600} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: c.rose600 }}>Delete contact</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
