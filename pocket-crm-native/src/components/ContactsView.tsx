import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Search, Sparkles, Star, Tag } from 'lucide-react-native';
import { useCrm } from '../store';
import { summarizeNotes } from '../ai';
import { c, r } from '../theme';
import { Avatar, Card, Chip } from './ui';

export function ContactsView() {
  const { contacts, openContact } = useCrm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  const allTags = useMemo(() => Array.from(new Set(contacts.flatMap((ct) => ct.tags))), [contacts]);

  const filtered = useMemo(() => contacts.filter((ct) => {
    if (selectedTag !== 'all' && !ct.tags.includes(selectedTag)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [ct.name, ct.company, ct.role, ct.notes, ct.howWeMet, ...ct.tags].some((v) => v.toLowerCase().includes(q));
  }), [contacts, searchQuery, selectedTag]);

  const resetFilters = () => { setSearchQuery(''); setSelectedTag('all'); };

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
          {filtered.map((ct) => {
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
          })}
        </View>
      )}
    </View>
  );
}
