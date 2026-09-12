import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Check, Clock, Plus, Search, Sparkles, Star, Tag } from 'lucide-react-native';
import { useCrm } from '../store';
import { getReminderInfo } from '../../crmHelpers';
import { c, r, reminderColors } from '../theme';
import { Avatar, Badge, Btn, Card, Chip, SocialIcon } from './ui';

export function ContactsView() {
  const { contacts, openContact, openAddContact, logTouchpoint, askAIForContact } = useCrm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [reminderFilter, setReminderFilter] = useState<'all' | 'urgent'>('all');

  const allTags = useMemo(() => Array.from(new Set(contacts.flatMap((ct) => ct.tags))), [contacts]);
  const urgentCount = contacts.filter((ct) => { const s = getReminderInfo(ct).status; return s === 'overdue' || s === 'today'; }).length;

  const filtered = useMemo(() => contacts.filter((ct) => {
    const info = getReminderInfo(ct);
    if (reminderFilter === 'urgent' && info.status !== 'overdue' && info.status !== 'today') return false;
    if (selectedTag !== 'all' && !ct.tags.includes(selectedTag)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [ct.name, ct.company, ct.role, ct.notes, ct.howWeMet, ...ct.tags].some((v) => v.toLowerCase().includes(q));
  }), [contacts, searchQuery, selectedTag, reminderFilter]);

  const resetFilters = () => { setSearchQuery(''); setSelectedTag('all'); setReminderFilter('all'); };

  return (
    <View style={{ gap: 14, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.slate900 }}>Network Contacts</Text>
          <Text style={{ fontSize: 12, color: c.slate500 }}>{contacts.length} connections • {urgentCount} due for follow-up</Text>
        </View>
        <Btn label="New Contact" icon={<Plus size={14} color={c.white} />} onPress={openAddContact} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.white, borderWidth: 1, borderColor: c.slate200, borderRadius: r.lg, paddingHorizontal: 12 }}>
        <Search size={16} color={c.slate400} />
        <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by name, role, tags, or notes..." placeholderTextColor={c.slate400} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 12, color: c.slate900 }} />
        {searchQuery ? <Pressable onPress={() => setSearchQuery('')}><Text style={{ fontSize: 12, color: c.slate400 }}>Clear</Text></Pressable> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <Chip label={`All (${contacts.length})`} active={reminderFilter === 'all' && selectedTag === 'all'} onPress={() => { setReminderFilter('all'); setSelectedTag('all'); }} />
        <Chip label={`Due Reminders (${urgentCount})`} icon={<Clock size={12} color={reminderFilter === 'urgent' ? c.white : c.amber800} />} active={reminderFilter === 'urgent'} activeBg={c.amber600} bg={c.amber50} text={c.amber800} onPress={() => { setReminderFilter(reminderFilter === 'urgent' ? 'all' : 'urgent'); setSelectedTag('all'); }} />
        {allTags.map((tag) => (
          <Chip key={tag} label={tag} icon={<Tag size={12} color={selectedTag === tag ? c.white : c.slate500} />} active={selectedTag === tag} activeBg={c.indigo600} onPress={() => { setSelectedTag(selectedTag === tag ? 'all' : tag); setReminderFilter('all'); }} />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 28, gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: c.slate700 }}>No contacts match your filters</Text>
          <Text style={{ fontSize: 12, color: c.slate400 }}>Try clearing search terms or create a new contact.</Text>
          <Pressable onPress={resetFilters}><Text style={{ fontSize: 12, fontWeight: '600', color: c.indigo600, marginTop: 6 }}>Reset Filters</Text></Pressable>
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {filtered.map((ct) => {
            const rem = getReminderInfo(ct);
            const sl = ct.socialLinks || {};
            return (
              <Card key={ct.id} style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <Pressable onPress={() => openContact(ct)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <Avatar name={ct.name} color={ct.avatarColor} size={40} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }} numberOfLines={1}>{ct.name}</Text>
                        {ct.isFavorite ? <Star size={12} color={c.amber500} fill={c.amber500} /> : null}
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '500', color: c.slate600 }} numberOfLines={1}>{ct.role} • {ct.company}</Text>
                      {ct.location ? <Text style={{ fontSize: 11, color: c.slate400 }} numberOfLines={1}>📍 {ct.location}</Text> : null}
                    </View>
                  </Pressable>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Badge label={rem.label} colors={reminderColors(rem.status, rem.daysDifference)} />
                    <Text style={{ fontSize: 10, color: c.slate400 }}>Cadence: {ct.reminderCadence}</Text>
                  </View>
                </View>

                {ct.notes ? (
                  <Pressable onPress={() => openContact(ct)} style={{ backgroundColor: c.slate50, padding: 10, borderRadius: r.lg, borderWidth: 1, borderColor: c.slate100 }}>
                    <Text style={{ fontSize: 12, color: c.slate600, lineHeight: 17 }} numberOfLines={2}>
                      <Text style={{ fontWeight: '600', color: c.slate700 }}>Notes: </Text>{ct.notes}
                    </Text>
                  </Pressable>
                ) : null}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.slate100 }}>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    {sl.linkedin ? <SocialIcon kind="linkedin" url={sl.linkedin} /> : null}
                    {sl.twitter ? <SocialIcon kind="twitter" url={sl.twitter} /> : null}
                    {sl.instagram ? <SocialIcon kind="instagram" url={sl.instagram} /> : null}
                    {sl.website ? <SocialIcon kind="website" url={sl.website} /> : null}
                    {sl.github ? <SocialIcon kind="github" url={sl.github} /> : null}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Pressable onPress={() => logTouchpoint(ct.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: r.md, backgroundColor: c.emerald50, borderWidth: 1, borderColor: c.emerald200 }}>
                      <Check size={12} color={c.emerald700} />
                      <Text style={{ fontSize: 11, fontWeight: '600', color: c.emerald700 }}>Log Touchpoint</Text>
                    </Pressable>
                    <Pressable onPress={() => askAIForContact(ct)} style={{ padding: 6, borderRadius: r.md, backgroundColor: c.indigo50, borderWidth: 1, borderColor: c.indigo200 }}>
                      <Sparkles size={14} color={c.indigo700} />
                    </Pressable>
                  </View>
                </View>

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
            );
          })}
        </View>
      )}
    </View>
  );
}
