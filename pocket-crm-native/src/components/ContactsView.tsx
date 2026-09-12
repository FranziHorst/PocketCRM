import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CalendarDays, MapPin, Search, Sparkles, Star, Tag, Users } from 'lucide-react-native';
import { ContactsGrouping, useCrm } from '../store';
import { Contact, CrmEvent } from '../../types';
import { summarizeNotes } from '../ai';
import { formatDate } from '../../crmHelpers';
import { c, r } from '../theme';
import { Avatar, Card, Chip } from './ui';

type Group = { key: string; title: string; contacts: Contact[]; event?: CrmEvent };

const GROUPINGS: { value: ContactsGrouping; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'events', label: 'Events' },
  { value: 'az', label: 'A–Z' },
];

function daysAgo(iso?: string): number {
  if (!iso) return Number.MAX_SAFE_INTEGER;
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - d.getTime()) / 86400000);
}

function buildGroups(list: Contact[], mode: ContactsGrouping, events: CrmEvent[]): Group[] {
  if (mode === 'recent') {
    const sorted = [...list].sort((a, b) => daysAgo(a.metOn ?? a.lastContacted) - daysAgo(b.metOn ?? b.lastContacted));
    const buckets: Group[] = [
      { key: 'week', title: 'This week', contacts: [] },
      { key: 'month', title: 'This month', contacts: [] },
      { key: 'earlier', title: 'Earlier', contacts: [] },
    ];
    for (const ct of sorted) {
      const d = daysAgo(ct.metOn ?? ct.lastContacted);
      buckets[d < 7 ? 0 : d < 30 ? 1 : 2].contacts.push(ct);
    }
    return buckets.filter((g) => g.contacts.length > 0);
  }
  if (mode === 'events') {
    const byEvent = [...events].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
    const groups: Group[] = byEvent
      .map((ev) => ({ key: ev.id, title: ev.name, event: ev, contacts: list.filter((ct) => ct.eventId === ev.id) }))
      .filter((g) => g.contacts.length > 0);
    const other = list.filter((ct) => !ct.eventId || !events.some((e) => e.id === ct.eventId));
    if (other.length) groups.push({ key: 'other', title: 'Met elsewhere', contacts: other });
    return groups;
  }
  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
  const map = new Map<string, Contact[]>();
  for (const ct of sorted) {
    const letter = (ct.name.replace(/^(dr|prof|mr|ms|mrs)\.?\s+/i, '').charAt(0) || '#').toUpperCase();
    map.set(letter, [...(map.get(letter) ?? []), ct]);
  }
  return Array.from(map.entries()).map(([k, v]) => ({ key: k, title: k, contacts: v }));
}

function eventDateLabel(ev: CrmEvent): string {
  const start = formatDate(ev.startDate);
  if (!ev.endDate || ev.endDate === ev.startDate) return start;
  return `${start} – ${formatDate(ev.endDate)}`;
}

export function ContactsView() {
  const { contacts, events, openContact, contactsGrouping, setContactsGrouping } = useCrm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  const allTags = useMemo(() => Array.from(new Set(contacts.flatMap((ct) => ct.tags))), [contacts]);

  const filtered = useMemo(() => contacts.filter((ct) => {
    if (selectedTag !== 'all' && !ct.tags.includes(selectedTag)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [ct.name, ct.company, ct.role, ct.notes, ct.howWeMet, ...ct.tags].some((v) => v.toLowerCase().includes(q));
  }), [contacts, searchQuery, selectedTag]);

  const favorites = filtered.filter((ct) => ct.isFavorite);
  const groups = useMemo(() => buildGroups(filtered.filter((ct) => !ct.isFavorite), contactsGrouping, events), [filtered, contactsGrouping, events]);

  const resetFilters = () => { setSearchQuery(''); setSelectedTag('all'); };

  const renderContact = (ct: Contact) => {
    const summary = summarizeNotes(ct.notes);
    return (
      <Pressable key={ct.id} onPress={() => openContact(ct)}>
        <Card style={{ gap: 10, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={ct.name} color={ct.avatarColor} size={40} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }} numberOfLines={1}>{ct.name}</Text>
                {ct.isFavorite ? <Star size={12} color={c.amber500} fill={c.amber500} /> : null}
              </View>
              <Text style={{ fontSize: 12, fontWeight: '500', color: c.slate600 }} numberOfLines={1}>{ct.role} • {ct.company}</Text>
              {ct.location ? <Text style={{ fontSize: 11, color: c.slate400 }} numberOfLines={1}>📍 {ct.location}</Text> : null}
            </View>
          </View>
          {summary ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: c.violet50, padding: 10, borderRadius: r.lg, borderWidth: 1, borderColor: c.violet100 }}>
              <Sparkles size={12} color={c.violet600} style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, fontSize: 12, color: c.slate700, lineHeight: 17 }} numberOfLines={2}>{summary}</Text>
            </View>
          ) : null}
          {ct.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {ct.tags.map((t) => (
                <Pressable key={t} onPress={() => setSelectedTag(t)} style={{ backgroundColor: c.slate100, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '500', color: c.slate600 }}>#{t}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>
      </Pressable>
    );
  };

  const renderHeader = (g: Group) => (
    <View style={{ gap: 4, marginTop: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: c.slate900 }}>{g.title}</Text>
        <Text style={{ fontSize: 11, color: c.slate400 }}>{g.contacts.length}</Text>
      </View>
      {g.event && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CalendarDays size={12} color={c.slate500} />
            <Text style={{ fontSize: 11, color: c.slate500 }}>{eventDateLabel(g.event)}{g.event.source === 'calendar' ? ' · synced from calendar' : ''}</Text>
          </View>
          {g.event.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color={c.slate500} />
              <Text style={{ fontSize: 11, color: c.slate500 }}>{g.event.location}</Text>
            </View>
          ) : null}
          {g.event.networkAttendees ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.emerald50, borderRadius: r.full, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Users size={12} color={c.emerald700} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: c.emerald700 }}>{g.event.networkAttendees} from your network {daysAgo(g.event.startDate) > 0 ? 'were there' : 'are going'}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View style={{ gap: 14, paddingBottom: 24 }}>
      <View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: c.slate900 }}>Network Contacts</Text>
        <Text style={{ fontSize: 12, color: c.slate500 }}>{contacts.length} connections</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.white, borderWidth: 1, borderColor: c.slate200, borderRadius: r.lg, paddingHorizontal: 12 }}>
        <Search size={16} color={c.slate400} />
        <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by name, role, tags, or notes..." placeholderTextColor={c.slate400} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 12, color: c.slate900 }} />
        {searchQuery ? <Pressable onPress={() => setSearchQuery('')}><Text style={{ fontSize: 12, color: c.slate400 }}>Clear</Text></Pressable> : null}
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: c.slate100, borderRadius: r.lg, padding: 3 }}>
        {GROUPINGS.map((g) => {
          const on = contactsGrouping === g.value;
          return (
            <Pressable key={g.value} onPress={() => setContactsGrouping(g.value)} style={{ flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: 'center', backgroundColor: on ? c.white : 'transparent' }}>
              <Text style={{ fontSize: 12, fontWeight: on ? '700' : '500', color: on ? c.slate900 : c.slate500 }}>{g.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <Chip label={`All (${contacts.length})`} active={selectedTag === 'all'} onPress={() => setSelectedTag('all')} />
        {allTags.map((tag) => (
          <Chip key={tag} label={tag} icon={<Tag size={12} color={selectedTag === tag ? c.white : c.slate500} />} active={selectedTag === tag} activeBg={c.indigo600} onPress={() => setSelectedTag(selectedTag === tag ? 'all' : tag)} />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 28, gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: c.slate700 }}>No contacts match your filters</Text>
          <Text style={{ fontSize: 12, color: c.slate400 }}>Try clearing search terms or create a new contact.</Text>
          <Pressable onPress={resetFilters}><Text style={{ fontSize: 12, fontWeight: '600', color: c.indigo600, marginTop: 6 }}>Reset Filters</Text></Pressable>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {favorites.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Star size={13} color={c.amber500} fill={c.amber500} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: c.slate900 }}>Favorites</Text>
              </View>
              {favorites.map(renderContact)}
            </>
          )}
          {groups.map((g) => (
            <React.Fragment key={g.key}>
              {renderHeader(g)}
              {g.contacts.map(renderContact)}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}
