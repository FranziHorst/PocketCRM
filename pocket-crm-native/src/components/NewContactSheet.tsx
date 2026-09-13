import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { useCrm } from '../store';
import { Contact } from '../../types';
import { c, r } from '../theme';
import { Btn, ModalShell } from './ui';
import { ContactFields } from './ContactFields';

export function NewContactSheet() {
  const { newContact, closeAddContact } = useCrm();
  if (!newContact) return null;
  return <Sheet key={newContact.id} initial={newContact} onClose={closeAddContact} />;
}

function Sheet({ initial, onClose }: { initial: Contact; onClose: () => void }) {
  const { saveContact } = useCrm();
  const router = useRouter();
  const [form, setForm] = useState<Contact>({ ...initial, socialLinks: { ...initial.socialLinks } });

  const add = () => {
    saveContact(form);
    onClose();
    router.push(`/(tabs)/contacts/${form.id}`);
  };

  return (
    <ModalShell
      visible
      sheet
      onClose={onClose}
      title="New contact"
      subtitle="Who did you meet?"
      icon={<View style={{ width: 36, height: 36, borderRadius: r.lg, backgroundColor: c.accentDark, alignItems: 'center', justifyContent: 'center' }}><UserPlus size={16} color={c.onDark} /></View>}
      footer={
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Btn label="Cancel" variant="ghost" onPress={onClose} />
          <Btn label="Add Contact" onPress={add} disabled={!form.name.trim()} />
        </View>
      }>
      <ContactFields form={form} setForm={setForm} />
    </ModalShell>
  );
}
