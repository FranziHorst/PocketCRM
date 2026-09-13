import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CalendarDays, Mail, MapPin, Phone, Tag } from 'lucide-react-native';
import { useCrm } from '../store';
import { Contact } from '../../types';
import { formatDate } from '../../crmHelpers';
import { c, r, t, font } from '../theme';
import { Group, Row, SocialIcon, openLink } from './ui';

const Label = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.textSecondary, marginBottom: 8, marginLeft: 4 }}>{children}</Text>
);

const IconRow = ({ icon, text, sub, onPress, first }: { icon: React.ReactNode; text: string; sub?: string; onPress?: () => void; first?: boolean }) => (
  <Row onPress={onPress} first={first}>
    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={[t.body, onPress && { color: c.accentDark }]}>{text}</Text>
      {sub ? <Text style={t.caption}>{sub}</Text> : null}
    </View>
  </Row>
);

// Lesende Darstellung eines Kontakts.
export function ContactDetails({ contact: ct }: { contact: Contact }) {
  const { events } = useCrm();
  const event = ct.eventId ? events.find((e) => e.id === ct.eventId) : undefined;
  const sl = ct.socialLinks || {};
  const socials = (['linkedin', 'twitter', 'instagram', 'website', 'github'] as const).filter((k) => sl[k]);
  const hasContact = !!(ct.location || ct.email || ct.phone);
  const hasMet = !!(event || ct.howWeMet || ct.metOn);
  const empty = !hasContact && !hasMet && !ct.notes && socials.length === 0 && ct.tags.length === 0;

  if (empty) {
    return <Text style={[t.secondary, { textAlign: 'center', paddingVertical: 28 }]}>No details yet. Tap Edit to add some.</Text>;
  }

  return (
    <View style={{ gap: 22 }}>
      {hasContact ? (
        <View>
          <Label>Contact</Label>
          <Group>
            {ct.location ? <IconRow first icon={<MapPin size={16} color={c.text2} />} text={ct.location} /> : null}
            {ct.email ? <IconRow first={!ct.location} icon={<Mail size={16} color={c.text2} />} text={ct.email} onPress={() => openLink(`mailto:${ct.email}`)} /> : null}
            {ct.phone ? <IconRow first={!ct.location && !ct.email} icon={<Phone size={16} color={c.text2} />} text={ct.phone} onPress={() => openLink(`tel:${ct.phone}`)} /> : null}
          </Group>
        </View>
      ) : null}

      {hasMet ? (
        <View>
          <Label>First contact</Label>
          <Group>
            {event ? <IconRow first icon={<CalendarDays size={16} color={c.text2} />} text={event.name} sub={[ct.metOn ? formatDate(ct.metOn) : '', event.location].filter(Boolean).join(', ')} /> : ct.metOn ? <IconRow first icon={<CalendarDays size={16} color={c.text2} />} text={formatDate(ct.metOn)} /> : null}
            {ct.howWeMet ? (
              <View style={{ paddingVertical: 12, borderTopWidth: event || ct.metOn ? 1 : 0, borderTopColor: c.line }}>
                <Text style={t.body}>{ct.howWeMet}</Text>
              </View>
            ) : null}
          </Group>
        </View>
      ) : null}

      {ct.notes ? (
        <View>
          <Label>Notes</Label>
          <Group style={{ paddingVertical: 14 }}>
            <Text style={t.body}>{ct.notes}</Text>
          </Group>
        </View>
      ) : null}

      {socials.length > 0 ? (
        <View>
          <Label>Profiles</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4 }}>
            {socials.map((k) => <SocialIcon key={k} kind={k} url={sl[k]!} withLabel />)}
          </View>
        </View>
      ) : null}

      {ct.tags.length > 0 ? (
        <View>
          <Label>Tags</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4 }}>
            {ct.tags.map((tag) => (
              <View key={tag} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: r.full, paddingHorizontal: 12, paddingVertical: 7 }}>
                <Tag size={12} color={c.textMuted} />
                <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.text2 }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
