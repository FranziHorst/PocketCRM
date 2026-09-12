import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CalendarDays, Check, Mail, MapPin, Tag } from 'lucide-react-native';
import { useCrm } from '../store';
import { Contact } from '../../types';
import { formatDate } from '../../crmHelpers';
import { c, r } from '../theme';
import { SocialIcon, openLink } from './ui';
import { Phone } from 'lucide-react-native';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ gap: 8 }}>
    <Text style={{ fontSize: 11, fontWeight: '700', color: c.slate400, textTransform: 'uppercase', letterSpacing: 0.8 }}>{title}</Text>
    {children}
  </View>
);

const Row = ({ icon, text, onPress }: { icon: React.ReactNode; text: string; onPress?: () => void }) => (
  <Pressable onPress={onPress} disabled={!onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: c.slate100, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
    <Text style={{ flex: 1, fontSize: 13, color: onPress ? c.indigo700 : c.slate800 }}>{text}</Text>
  </Pressable>
);

// Lesende Darstellung eines Kontakts (ohne Rahmen/Seite drumherum).
export function ContactDetails({ contact: ct }: { contact: Contact }) {
  const { events } = useCrm();
  const event = ct.eventId ? events.find((e) => e.id === ct.eventId) : undefined;
  const sl = ct.socialLinks || {};
  const socials = (['linkedin', 'twitter', 'instagram', 'website', 'github'] as const).filter((k) => sl[k]);
  const empty = !ct.location && !ct.email && !ct.phone && !ct.howWeMet && !ct.notes && !event && socials.length === 0 && ct.tags.length === 0;

  return (
    <View style={{ gap: 22 }}>
      {(ct.location || ct.email || ct.phone) ? (
        <Section title="Contact">
          {ct.location ? <Row icon={<MapPin size={14} color={c.slate600} />} text={ct.location} /> : null}
          {ct.email ? <Row icon={<Mail size={14} color={c.slate600} />} text={ct.email} onPress={() => openLink(`mailto:${ct.email}`)} /> : null}
          {ct.phone ? <Row icon={<Phone size={14} color={c.slate600} />} text={ct.phone} onPress={() => openLink(`tel:${ct.phone}`)} /> : null}
        </Section>
      ) : null}

      {(event || ct.howWeMet || ct.metOn) ? (
        <Section title="First contact">
          {event ? <Row icon={<CalendarDays size={14} color={c.slate600} />} text={`${event.name}${event.location ? ` · ${event.location}` : ''}`} /> : null}
          {ct.metOn ? <Row icon={<Check size={14} color={c.slate600} />} text={`First met on ${formatDate(ct.metOn)}`} /> : null}
          {ct.howWeMet ? <Text style={{ fontSize: 13, color: c.slate700, lineHeight: 19 }}>{ct.howWeMet}</Text> : null}
        </Section>
      ) : null}

      {ct.notes ? (
        <Section title="Notes">
          <View style={{ backgroundColor: c.slate50, padding: 12, borderRadius: r.lg, borderWidth: 1, borderColor: c.slate100 }}>
            <Text style={{ fontSize: 13, color: c.slate700, lineHeight: 19 }}>{ct.notes}</Text>
          </View>
        </Section>
      ) : null}

      {socials.length > 0 ? (
        <Section title="Profiles">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {socials.map((k) => <SocialIcon key={k} kind={k} url={sl[k]!} withLabel />)}
          </View>
        </Section>
      ) : null}

      {ct.tags.length > 0 ? (
        <Section title="Tags">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {ct.tags.map((t) => (
              <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.slate100, borderRadius: r.md, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Tag size={11} color={c.slate500} />
                <Text style={{ fontSize: 12, fontWeight: '500', color: c.slate700 }}>{t}</Text>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {empty ? <Text style={{ fontSize: 13, color: c.slate400, textAlign: 'center', paddingVertical: 20 }}>No details yet. Tap Edit to add some.</Text> : null}
    </View>
  );
}
