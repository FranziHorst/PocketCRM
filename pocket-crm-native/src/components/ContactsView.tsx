import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Building2, CalendarDays, ChevronRight, MapPin, Search, Star, Tag, User, Users, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ContactsGrouping, useCrm } from '../store';
import { Contact, CrmEvent } from '../../types';
import { summarizeNotes } from '../ai';
import { formatDate } from '../../crmHelpers';
import { c, r, t, font } from '../theme';
import { Avatar, Group, PageTitle, Row } from './ui';

type Group = { key: string; title: string; contacts: Contact[]; event?: CrmEvent };
type Filter = { kind: 'tag' | 'company' | 'event'; value: string; label: string };
type Suggestion = { key: string; kind: 'contact' | 'company' | 'tag' | 'event'; label: string; sub?: string; contact?: Contact; filter?: Filter };

const GROUPINGS: { value: ContactsGrouping; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'events', label: 'Events' },
  { value: 'az', label: 'A-Z' },
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
  return `${start} to ${formatDate(ev.endDate)}`;
}

export function ContactsView() {
  const { contacts, events, contactsGrouping, setContactsGrouping } = useCrm();
  const router = useRouter();
  const openContact = (ct: Contact) => router.push(`/(tabs)/contacts/${ct.id}`);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const setTagFilter = (tag: string) => { setFilter({ kind: 'tag', value: tag, label: `#${tag}` }); setSearchQuery(''); setShowSuggestions(false); };

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const out: Suggestion[] = [];
    const seen = new Set<string>();
    const push = (sg: Suggestion) => { if (!seen.has(sg.key)) { seen.add(sg.key); out.push(sg); } };
    contacts.forEach((ct) => { if (ct.name.toLowerCase().includes(q)) push({ key: `c:${ct.id}`, kind: 'contact', label: ct.name, sub: `${ct.role} • ${ct.company}`, contact: ct }); });
    contacts.forEach((ct) => { if (ct.company && ct.company.toLowerCase().includes(q)) push({ key: `co:${ct.company}`, kind: 'company', label: ct.company, sub: 'Company', filter: { kind: 'company', value: ct.company, label: ct.company } }); });
    contacts.flatMap((ct) => ct.tags).forEach((t) => { if (t.toLowerCase().includes(q)) push({ key: `t:${t}`, kind: 'tag', label: `#${t}`, sub: 'Tag', filter: { kind: 'tag', value: t, label: `#${t}` } }); });
    events.forEach((ev) => { if (ev.name.toLowerCase().includes(q)) push({ key: `e:${ev.id}`, kind: 'event', label: ev.name, sub: 'Event', filter: { kind: 'event', value: ev.id, label: ev.name } }); });
    return out.slice(0, 7);
  }, [searchQuery, contacts, events]);

  const filtered = useMemo(() => contacts.filter((ct) => {
    if (favoritesOnly && !ct.isFavorite) return false;
    if (filter?.kind === 'tag' && !ct.tags.includes(filter.value)) return false;
    if (filter?.kind === 'company' && ct.company !== filter.value) return false;
    if (filter?.kind === 'event' && ct.eventId !== filter.value) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [ct.name, ct.company, ct.role, ct.notes, ct.howWeMet, ...ct.tags].some((v) => v.toLowerCase().includes(q));
  }), [contacts, searchQuery, filter, favoritesOnly]);

  const groups = useMemo(() => buildGroups(filtered, contactsGrouping, events), [filtered, contactsGrouping, events]);

  const resetFilters = () => { setSearchQuery(''); setFilter(null); setFavoritesOnly(false); setShowSuggestions(false); };

  const renderContact = (ct: Contact, i: number) => {
    const summary = summarizeNotes(ct.notes, 90);
    return (
      <Row key={ct.id} first={i === 0} onPress={() => openContact(ct)} style={{ paddingVertical: 14 }}>
        <Avatar name={ct.name} color={ct.avatarColor} size={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 16, fontFamily: font.medium, color: c.text }} numberOfLines={1}>{ct.name}</Text>
            {ct.isFavorite ? <Star size={13} color={c.gold} fill={c.gold} /> : null}
          </View>
          <Text style={t.secondary} numberOfLines={1}>{[ct.role, ct.company].filter(Boolean).join(' at ')}</Text>
          {summary ? <Text style={[t.secondary, { color: c.textMuted, marginTop: 2 }]} numberOfLines={1}>{summary}</Text> : null}
        </View>
        <ChevronRight size={18} color={c.borderStrong} />
      </Row>
    );
  };

  const renderHeader = (g: Group) => (
    <View style={{ gap: 2, marginTop: 6, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text style={t.h2}>{g.title}</Text>
        <Text style={t.caption}>{g.contacts.length}</Text>
      </View>
      {g.event && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CalendarDays size={12} color={c.textMuted} />
            <Text style={t.caption}>{eventDateLabel(g.event)}</Text>
          </View>
          {g.event.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color={c.textMuted} />
              <Text style={t.caption}>{g.event.location}</Text>
            </View>
          ) : null}
          {g.event.networkAttendees ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Users size={12} color={c.accentDark} />
              <Text style={[t.caption, { color: c.accentDark }]}>{g.event.networkAttendees} from your network</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View style={{ gap: 14 }}>
      <PageTitle title="Contacts" subtitle={`${contacts.length} ${contacts.length === 1 ? 'person' : 'people'} you've met`} />

      <View style={{ zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, borderWidth: 1, borderColor: showSuggestions && suggestions.length ? c.accentDark : c.line, borderRadius: r.xl, paddingHorizontal: 14, minHeight: 46 }}>
          <Search size={18} color={c.textMuted} />
          {filter ? (
            <Pressable onPress={() => setFilter(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.accentDark, borderRadius: r.full, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, fontFamily: font.medium, color: c.onDark }}>{filter.label}</Text>
              <X size={12} color={c.onDark} />
            </Pressable>
          ) : null}
          <TextInput
            value={searchQuery}
            onChangeText={(v) => { setSearchQuery(v); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={filter ? 'Search within…' : 'Search people, companies, tags, events'}
            placeholderTextColor={c.textMuted}
            style={{ flex: 1, paddingVertical: 10, fontSize: 15, fontFamily: font.regular, color: c.text }}
          />
          {searchQuery ? <Pressable onPress={() => { setSearchQuery(''); setShowSuggestions(false); }} hitSlop={8}><X size={16} color={c.textMuted} /></Pressable> : null}
        </View>

        {showSuggestions && suggestions.length > 0 && (
          <View style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: r.xl, overflow: 'hidden', shadowColor: c.text, shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
            {suggestions.map((sg, i) => {
              const Icon = sg.kind === 'contact' ? User : sg.kind === 'company' ? Building2 : sg.kind === 'tag' ? Tag : CalendarDays;
              return (
                <Pressable
                  key={sg.key}
                  onPress={() => {
                    if (sg.contact) { openContact(sg.contact); setShowSuggestions(false); return; }
                    if (sg.filter) { setFilter(sg.filter); setSearchQuery(''); setShowSuggestions(false); }
                  }}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: pressed ? c.surfaceSoft : c.surface, borderTopWidth: i ? 1 : 0, borderTopColor: c.line })}>
                  {sg.contact ? <Avatar name={sg.contact.name} color={sg.contact.avatarColor} size={28} /> : (
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} color={c.textSecondary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: font.medium, color: c.text }} numberOfLines={1}>{sg.label}</Text>
                    {sg.sub ? <Text style={t.caption} numberOfLines={1}>{sg.sub}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.line, borderRadius: r.full, padding: 3 }}>
          {GROUPINGS.map((g) => {
            const on = contactsGrouping === g.value;
            return (
              <Pressable key={g.value} onPress={() => setContactsGrouping(g.value)} style={{ flex: 1, paddingVertical: 8, borderRadius: r.full, alignItems: 'center', backgroundColor: on ? c.surface : 'transparent' }}>
                <Text style={{ fontSize: 13, fontFamily: on ? font.display : font.medium, color: on ? c.text : c.textSecondary }}>{g.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => setFavoritesOnly(!favoritesOnly)}
          accessibilityLabel="Favorites only"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 9, borderRadius: r.full, borderWidth: 1, borderColor: favoritesOnly ? c.goldBorder : c.line, backgroundColor: favoritesOnly ? c.goldSoft : c.surface }}>
          <Star size={14} color={c.gold} fill={favoritesOnly ? c.gold : 'transparent'} />
          <Text style={{ fontSize: 13, fontFamily: font.medium, color: favoritesOnly ? c.text : c.textSecondary }}>Favorites</Text>
        </Pressable>
      </View>

      {filtered.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 36, gap: 6 }}>
          <Text style={t.bodyStrong}>{favoritesOnly ? 'No favorites match' : 'No contacts match'}</Text>
          <Text style={t.secondary}>Try another search or clear the filters.</Text>
          <Pressable onPress={resetFilters} hitSlop={8}><Text style={{ fontSize: 15, fontFamily: font.medium, color: c.accentDark, marginTop: 8 }}>Clear filters</Text></Pressable>
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          {groups.map((g) => (
            <View key={g.key}>
              {renderHeader(g)}
              <Group>{g.contacts.map(renderContact)}</Group>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
