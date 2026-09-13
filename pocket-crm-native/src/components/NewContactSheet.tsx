import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TriangleAlert, UserPlus } from 'lucide-react-native';
import { useCrm } from '../store';
import { Contact } from '../../types';
import { DuplicateMatch, findDuplicate } from '../../crmHelpers';
import { c, font, r } from '../theme';
import { Btn, ModalShell } from './ui';
import { ContactFields } from './ContactFields';

export function NewContactSheet() {
  const { newContact, closeAddContact } = useCrm();
  if (!newContact) return null;
  return <Sheet key={newContact.id} initial={newContact} onClose={closeAddContact} />;
}

function Sheet({ initial, onClose }: { initial: Contact; onClose: () => void }) {
  const { saveContact, contacts } = useCrm();
  const router = useRouter();
  const [form, setForm] = useState<Contact>({ ...initial, socialLinks: { ...initial.socialLinks } });
  const duplicate = useMemo(() => findDuplicate(form, contacts), [form, contacts]);

  // withAnchor: die Kontaktliste liegt unter der Detailseite, auch wenn der Sheet vom
  // Home-Tab aus geoeffnet wurde - sonst gibt es kein Zurueck und der Contacts-Tab
  // zeigt nur diesen einen Kontakt.
  const open = (id: string) => {
    onClose();
    router.push(`/(tabs)/contacts/${id}`, { withAnchor: true });
  };

  const add = () => {
    saveContact(form);
    open(form.id);
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
          <Btn label={duplicate ? 'Add anyway' : 'Add Contact'} onPress={add} disabled={!form.name.trim()} />
        </View>
      }>
      {duplicate ? <DuplicateNotice match={duplicate} onOpen={() => open(duplicate.contact.id)} /> : null}
      <ContactFields form={form} setForm={setForm} />
    </ModalShell>
  );
}

const DuplicateNotice = ({ match, onOpen }: { match: DuplicateMatch; onOpen: () => void }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, padding: 12, borderRadius: r.lg, backgroundColor: c.dangerSoft, borderWidth: 1, borderColor: c.dangerBorder }}>
    <TriangleAlert size={16} color={c.dangerDark} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.dangerDark }} numberOfLines={1}>
        {match.contact.name} is already saved
      </Text>
      <Text style={{ fontSize: 12, fontFamily: font.regular, color: c.dangerDark }}>Matched by {match.reason}.</Text>
    </View>
    <Pressable onPress={onOpen} hitSlop={8}>
      <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.dangerDark, textDecorationLine: 'underline' }}>Open</Text>
    </Pressable>
  </View>
);
