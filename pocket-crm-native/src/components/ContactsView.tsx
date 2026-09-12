import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Building2, CalendarDays, MapPin, Search, Sparkles, Star, Tag, User, Users, X } from 'lucide-react-native';
import { ContactsGrouping, useCrm } from '../store';
import { Contact, CrmEvent } from '../../types';
import { summarizeNotes } from '../ai';
import { formatDate } from '../../crmHelpers';
import { c, r } from '../theme';
import { Avatar, Card } from './ui';

type Group = { key: string; title: string; contacts: Contact[]; event?: CrmEvent };
type Filter = { kind: 'tag' | 'company' | 'event'; value: string; label: string };
type Suggestion = { key: string; kind: 'contact' | 'company' | 'tag' | 'event'; label: string; sub?: string; contact?: Contact; filter?: Filter };

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
                <Pressable key={t} onPress={() => setTagFilter(t)} style={{ backgroundColor: c.slate100, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
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

      <View style={{ zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.white, borderWidth: 1, borderColor: showSuggestions && suggestions.length ? c.indigo500 : c.slate200, borderRadius: r.lg, paddingHorizontal: 12 }}>
          <Search size={16} color={c.slate400} />
          {filter ? (
            <Pressable onPress={() => setFilter(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.indigo600, borderRadius: r.full, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: c.white }}>{filter.label}</Text>
              <X size={12} color={c.white} />
            </Pressable>
          ) : null}
          <TextInput
            value={searchQuery}
            onChangeText={(v) => { setSearchQuery(v); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={filter ? 'Search within…' : 'Search people, companies, tags, events…'}
            placeholderTextColor={c.slate400}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 4, fontSize: 12, color: c.slate900 }}
          />
          {searchQuery ? <Pressable onPress={() => { setSearchQuery(''); setShowSuggestions(false); }} hitSlop={6}><X size={14} color={c.slate400} /></Pressable> : null}
        </View>

        {showSuggestions && suggestions.length > 0 && (
          <View style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, backgroundColor: c.white, borderWidth: 1, borderColor: c.slate200, borderRadius: r.lg, overflow: 'hidden', shadowColor: c.slate900, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
            {suggestions.map((sg, i) => {
              const Icon = sg.kind === 'contact' ? User : sg.kind === 'company' ? Building2 : sg.kind === 'tag' ? Tag : CalendarDays;
              return (
                <Pressable
                  key={sg.key}
                  onPress={() => {
                    if (sg.contact) { openContact(sg.contact); setShowSuggestions(false); return; }
                    if (sg.filter) { setFilter(sg.filter); setSearchQuery(''); setShowSuggestions(false); }
                  }}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: pressed ? c.slate50 : c.white, borderTopWidth: i ? 1 : 0, borderTopColor: c.slate100 })}>
                  {sg.contact ? <Avatar name={sg.contact.name} color={sg.contact.avatarColor} size={26} /> : (
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.slate100, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} color={c.slate600} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: c.slate900 }} numberOfLines={1}>{sg.label}</Text>
                    {sg.sub ? <Text style={{ fontSize: 10, color: c.slate500 }} numberOfLines={1}>{sg.sub}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.slate100, borderRadius: r.lg, padding: 3 }}>
          {GROUPINGS.map((g) => {
            const on = contactsGrouping === g.value;
            return (
              <Pressable key={g.value} onPress={() => setContactsGrouping(g.value)} style={{ flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: 'center', backgroundColor: on ? c.white : 'transparent' }}>
                <Text style={{ fontSize: 12, fontWeight: on ? '700' : '500', color: on ? c.slate900 : c.slate500 }}>{g.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => setFavoritesOnly(!favoritesOnly)}
          accessibilityLabel="Favorites only"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 9, borderRadius: r.lg, borderWidth: 1, borderColor: favoritesOnly ? c.amber400 : c.slate200, backgroundColor: favoritesOnly ? c.amber50 : c.white }}>
          <Star size={14} color={c.amber500} fill={favoritesOnly ? c.amber500 : 'transparent'} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: favoritesOnly ? c.amber800 : c.slate600 }}>Favorites</Text>
        </Pressable>
      </View>

      {filtered.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 28, gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: c.slate700 }}>{favoritesOnly ? 'No favorites match' : 'No contacts match your filters'}</Text>
          <Text style={{ fontSize: 12, color: c.slate400 }}>Try clearing search terms or create a new contact.</Text>
          <Pressable onPress={resetFilters}><Text style={{ fontSize: 12, fontWeight: '600', color: c.indigo600, marginTop: 6 }}>Reset Filters</Text></Pressable>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
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
