import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Check, Sparkles, Tag } from 'lucide-react-native';
import { useCrm } from '../store';
import { Contact, TagSuggestion } from '../../types';
import { suggestTags } from '../ai';
import { c, r } from '../theme';
import { Btn, Field, Input, SelectField } from './ui';
import { formatDate } from '../../crmHelpers';

// Formularfelder eines Kontakts; wird vom "New contact"-Sheet und vom Bearbeiten-Modus der Kontaktseite genutzt.
export function ContactFields({ form, setForm }: { form: Contact; setForm: (f: Contact) => void }) {
  const { events } = useCrm();
  const [newTag, setNewTag] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const set = (patch: Partial<Contact>) => setForm({ ...form, ...patch });
  const setSocial = (key: keyof Contact['socialLinks'], v: string) => setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: v } });

  const handleSuggest = async () => {
    setSuggesting(true); setAiError(null); setSuggestions([]); setSelected([]);
    try {
      const tags = await suggestTags(form);
      if (tags.length === 0) setAiError('No tags generated. Try adding more notes about this contact.');
      setSuggestions(tags);
      setSelected(tags.filter((t) => !form.tags.includes(t.tag)).map((t) => t.tag));
    } catch (e: any) {
      setAiError(e?.message || 'Failed to generate suggestions.');
    } finally {
      setSuggesting(false);
    }
  };

  const addTag = () => {
    const t = newTag.trim();
    if (t && !form.tags.includes(t)) set({ tags: [...form.tags, t] });
    setNewTag('');
  };

  return (
    <View>
      <Field label="Full Name *" value={form.name} onChangeText={(v) => set({ name: v })} placeholder="e.g., Maya Lin" />
      <Field label="Job Title / Role" value={form.role} onChangeText={(v) => set({ role: v })} placeholder="e.g., VP of Product" />
      <Field label="Company / Organization" value={form.company} onChangeText={(v) => set({ company: v })} placeholder="e.g., Loomis AI" />
      <Field label="Email" value={form.email || ''} onChangeText={(v) => set({ email: v })} placeholder="maya@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Phone Number" value={form.phone || ''} onChangeText={(v) => set({ phone: v })} placeholder="+1 (415) ..." keyboardType="phone-pad" />
      <Field label="Location" value={form.location || ''} onChangeText={(v) => set({ location: v })} placeholder="e.g., San Francisco, CA" />

      <Text style={{ fontSize: 12, fontWeight: '700', color: c.text, marginBottom: 8 }}>Connected Social Media Profiles</Text>
      <Field label="LinkedIn" value={form.socialLinks.linkedin || ''} onChangeText={(v) => setSocial('linkedin', v)} placeholder="https://linkedin.com/in/..." autoCapitalize="none" />
      <Field label="X / Twitter" value={form.socialLinks.twitter || ''} onChangeText={(v) => setSocial('twitter', v)} placeholder="https://x.com/... or @handle" autoCapitalize="none" />
      <Field label="Instagram" value={form.socialLinks.instagram || ''} onChangeText={(v) => setSocial('instagram', v)} placeholder="https://instagram.com/..." autoCapitalize="none" />
      <Field label="Website" value={form.socialLinks.website || ''} onChangeText={(v) => setSocial('website', v)} placeholder="Personal website or blog URL" autoCapitalize="none" />

      <SelectField
        label="First met at"
        value={form.eventId ?? ''}
        placeholder="No event"
        searchable={events.length > 6}
        options={[{ value: '', label: 'No event' }, ...events.map((ev) => ({ value: ev.id, label: ev.name, sub: [formatDate(ev.startDate), ev.location].filter(Boolean).join(' · ') }))]}
        onChange={(v) => set({ eventId: v || undefined })}
      />
      <Field label="How we met / mutual connection" value={form.howWeMet} onChangeText={(v) => set({ howWeMet: v })} placeholder="e.g., SaaStr 2026 conference panel on agentic UX" />
      <Field label="Conversation Notes, Interests & Follow-up Context" value={form.notes} onChangeText={(v) => set({ notes: v })} multiline placeholder="Key discussion topics, what they care about, personal details, collaboration ideas..." />

      <View style={{ backgroundColor: c.surfaceSoft, padding: 14, borderRadius: r.xl, borderWidth: 1, borderColor: c.border, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Tag size={14} color={c.accent} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.text }}>Tags & Organization</Text>
          </View>
          <Pressable onPress={handleSuggest} disabled={suggesting} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.accentDark, paddingHorizontal: 10, paddingVertical: 5, borderRadius: r.md, opacity: suggesting ? 0.5 : 1 }}>
            {suggesting ? <ActivityIndicator size="small" color={c.onDark} /> : <Sparkles size={12} color={c.onDark} />}
            <Text style={{ fontSize: 11, fontWeight: '600', color: c.onDark }}>{suggesting ? 'AI Thinking...' : 'Suggest AI Tags'}</Text>
          </Pressable>
        </View>

        {aiError ? <Text style={{ fontSize: 11, color: c.danger, backgroundColor: c.dangerSoft, padding: 8, borderRadius: r.md }}>{aiError}</Text> : null}

        {suggestions.length > 0 && (
          <View style={{ backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentBorder, borderRadius: r.lg, padding: 10, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: c.accentDeep }}>Suggested Tags:</Text>
              <Pressable onPress={() => { set({ tags: Array.from(new Set([...form.tags, ...selected])) }); setSuggestions([]); setSelected([]); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Check size={12} color={c.accent} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: c.accent }}>Add Selected ({selected.length})</Text>
              </Pressable>
            </View>
            {suggestions.map((sg) => {
              const on = selected.includes(sg.tag);
              return (
                <Pressable key={sg.tag} onPress={() => setSelected(on ? selected.filter((t) => t !== sg.tag) : [...selected, sg.tag])} style={{ padding: 8, borderRadius: r.md, borderWidth: 1, borderColor: on ? c.accentDark : c.border, backgroundColor: on ? c.accent : c.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: on ? c.surface : c.text2 }}>
                    <Text style={{ fontWeight: '600' }}>#{sg.tag}</Text>
                    <Text style={{ fontSize: 10, color: on ? c.accentSoft2 : c.textMuted }}>  • {sg.reason}</Text>
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: on ? c.surface : c.text2 }}>{on ? '✓' : '+'}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {form.tags.map((t) => (
            <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '500', color: c.text }}>#{t}</Text>
              <Pressable onPress={() => set({ tags: form.tags.filter((x) => x !== t) })} hitSlop={6}>
                <Text style={{ fontSize: 13, color: c.textMuted }}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Input value={newTag} onChangeText={setNewTag} onSubmitEditing={addTag} placeholder="Add custom tag (e.g., Angel Investor)..." style={{ flex: 1 }} />
          <Btn label="Add" variant="ghost" onPress={addTag} />
        </View>
      </View>
    </View>
  );
}
