import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Camera, FileDown, Plus, RefreshCw, Trash2, X } from 'lucide-react-native';
import { useCrm } from '../store';
import { UserProfile } from '../../types';
import { isCalendarEvent } from '../calendar';
import { exportContactsCsv } from '../csv';
import { buildContactCard } from '../contactCard';
import { c, r, t, font } from '../theme';
import { QrCode } from './QrCode';
import { Avatar, Btn, Field, Group, PageTitle, Row, SocialIcon, TextBtn } from './ui';

const Label = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.textSecondary, marginBottom: 8, marginLeft: 4 }}>{children}</Text>
);

export function ProfileView() {
  const { userProfile, contacts, events, updateProfile, calendarSync, calendarSyncedAt, calendarSyncing, setCalendarSync, refreshCalendar } = useCrm();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>(userProfile);
  const [editingGoals, setEditingGoals] = useState(false);
  const [goals, setGoals] = useState<string[]>(userProfile.networkingGoals);
  const [newGoal, setNewGoal] = useState('');

  const startEdit = () => { setForm({ ...userProfile, socialLinks: { ...userProfile.socialLinks } }); setEditing(true); };
  const save = () => { if (form.name.trim()) updateProfile({ ...form, networkingGoals: userProfile.networkingGoals }); setEditing(false); };
  const set = (patch: Partial<UserProfile>) => setForm((f) => ({ ...f, ...patch }));
  const setSocial = (key: keyof UserProfile['socialLinks'], v: string) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: v } }));

  const startEditGoals = () => { setGoals([...userProfile.networkingGoals]); setNewGoal(''); setEditingGoals(true); };
  const saveGoals = () => { updateProfile({ ...userProfile, networkingGoals: goals }); setEditingGoals(false); };
  const addGoal = () => { const g = newGoal.trim(); if (g && !goals.includes(g)) setGoals([...goals, g]); setNewGoal(''); };

  const notify = (msg: string) => { if (Platform.OS === 'web') window.alert(msg); else Alert.alert(msg); };
  // Bildauswahl erst beim Antippen laden, damit die App ohne neu gebaute Hülle nicht schon beim Start scheitert.
  const pickPhoto = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { notify('Photo access is needed to pick a profile picture.'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.4, base64: true });
      if (res.canceled || !res.assets[0]) return;
      const a = res.assets[0];
      set({ avatarUri: a.base64 ? `data:${a.mimeType || 'image/jpeg'};base64,${a.base64}` : a.uri });
    } catch {
      notify('Photo picker is not available in this build yet. Rebuild the app shell to enable it.');
    }
  };

  const toggleCalendar = async (on: boolean) => {
    const res = await setCalendarSync(on);
    if (res.ok) return;
    notify(res.reason === 'denied'
      ? 'Calendar access was declined. You can allow it under Settings > Pocket CRM > Calendars.'
      : 'Calendar access is not available in this build yet. Rebuild the app shell to enable it.');
  };

  const calendarEventCount = events.filter(isCalendarEvent).length;
  const calendarStatus = calendarSyncing
    ? 'Reading your calendar…'
    : calendarSync
      ? "New contacts are linked to the event you're at."
      : "Off. Turn on to link new contacts to the event you're at.";
  const syncedLabel = calendarSyncedAt
    ? new Date(calendarSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const sl = userProfile.socialLinks || {};
  const socials = (['linkedin', 'twitter', 'instagram', 'website', 'github'] as const).filter((k) => sl[k]);

  if (editing) {
    return (
      <View style={{ gap: 22 }}>
        <PageTitle title="Edit profile" right={<TextBtn label="Cancel" onPress={() => setEditing(false)} />} />

        <View style={{ alignItems: 'center', gap: 10 }}>
          <Pressable onPress={pickPhoto} accessibilityLabel="Change photo">
            <Avatar name={form.name} color={form.avatarColor} uri={form.avatarUri} size={88} radius={28} />
            <View style={{ position: 'absolute', right: -4, bottom: -4, width: 30, height: 30, borderRadius: 15, backgroundColor: c.text, borderWidth: 3, borderColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={14} color={c.onDark} />
            </View>
          </Pressable>
          {form.avatarUri ? (
            <Pressable onPress={() => set({ avatarUri: undefined })} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Trash2 size={13} color={c.danger} />
              <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.danger }}>Remove photo</Text>
            </Pressable>
          ) : <Text style={t.caption}>Tap to change photo</Text>}
        </View>

        <View>
          <Label>About you</Label>
          <Group style={{ paddingVertical: 16 }}>
            <Field label="Full name" value={form.name} onChangeText={(v) => set({ name: v })} />
            <Field label="Age" value={String(form.age || '')} onChangeText={(v) => set({ age: Number(v) || 0 })} keyboardType="number-pad" />
            <Field label="Job title" value={form.jobTitle} onChangeText={(v) => set({ jobTitle: v })} />
            <Field label="Company" value={form.company} onChangeText={(v) => set({ company: v })} />
            <Field label="Location" value={form.location} onChangeText={(v) => set({ location: v })} />
            <Field label="Email" value={form.email} onChangeText={(v) => set({ email: v })} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Bio" value={form.bio} onChangeText={(v) => set({ bio: v })} multiline />
          </Group>
        </View>

        <View>
          <Label>Profiles</Label>
          <Group style={{ paddingVertical: 16 }}>
            <Field label="LinkedIn" value={form.socialLinks.linkedin || ''} onChangeText={(v) => setSocial('linkedin', v)} placeholder="LinkedIn profile URL" autoCapitalize="none" />
            <Field label="X / Twitter" value={form.socialLinks.twitter || ''} onChangeText={(v) => setSocial('twitter', v)} placeholder="Handle or URL" autoCapitalize="none" />
            <Field label="Instagram" value={form.socialLinks.instagram || ''} onChangeText={(v) => setSocial('instagram', v)} placeholder="Handle or URL" autoCapitalize="none" />
            <Field label="Website" value={form.socialLinks.website || ''} onChangeText={(v) => setSocial('website', v)} placeholder="URL" autoCapitalize="none" />
          </Group>
        </View>

        <Btn label="Save changes" onPress={save} disabled={!form.name.trim()} />
      </View>
    );
  }

  return (
    <View style={{ gap: 22 }}>
      <PageTitle title="Profile" right={<TextBtn label="Edit" onPress={startEdit} />} />

      <View style={{ alignItems: 'center', gap: 6 }}>
        <Avatar name={userProfile.name} color={userProfile.avatarColor} uri={userProfile.avatarUri} size={88} radius={28} />
        <Text style={{ fontSize: 24, fontFamily: font.display, letterSpacing: -0.3, color: c.text, textAlign: 'center', marginTop: 6 }}>{userProfile.name}</Text>
        {(userProfile.jobTitle || userProfile.company) ? <Text style={[t.secondary, { textAlign: 'center' }]}>{[userProfile.jobTitle, userProfile.company].filter(Boolean).join(' at ')}</Text> : null}
        {(userProfile.location || userProfile.email) ? <Text style={[t.caption, { textAlign: 'center' }]}>{[userProfile.location, userProfile.email].filter(Boolean).join(' · ')}</Text> : null}
      </View>

      {userProfile.bio ? (
        <View>
          <Label>About</Label>
          <Group style={{ paddingVertical: 14 }}>
            <Text style={t.body}>{userProfile.bio}</Text>
          </Group>
        </View>
      ) : null}

      <View>
        <Label>My QR code</Label>
        <Group style={{ paddingVertical: 18, alignItems: 'center', gap: 10 }}>
          <QrCode value={buildContactCard(userProfile)} size={240} />
          <Text style={[t.caption, { textAlign: 'center' }]}>Let someone scan this with Pocket CRM to add you as a contact.</Text>
        </Group>
      </View>

      {socials.length > 0 ? (
        <View>
          <Label>Profiles</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4 }}>
            {socials.map((k) => <SocialIcon key={k} kind={k} url={sl[k]!} withLabel />)}
          </View>
        </View>
      ) : null}

      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.textSecondary }}>Networking goals</Text>
          {!editingGoals ? <TextBtn label="Edit" onPress={startEditGoals} /> : null}
        </View>
        {editingGoals ? (
          <Group style={{ paddingVertical: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {goals.map((g) => (
                <View key={g} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentBorder, borderRadius: r.full, paddingLeft: 12, paddingRight: 8, paddingVertical: 7 }}>
                  <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.accentDeep }}>{g}</Text>
                  <Pressable onPress={() => setGoals(goals.filter((x) => x !== g))} hitSlop={6}><X size={14} color={c.accentDark} /></Pressable>
                </View>
              ))}
              {goals.length === 0 ? <Text style={t.caption}>No goals yet.</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput value={newGoal} onChangeText={setNewGoal} onSubmitEditing={addGoal} placeholder="Add a goal" placeholderTextColor={c.textMuted} style={{ flex: 1, backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: c.border, borderRadius: r.lg, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, fontFamily: font.regular, color: c.text }} />
              <Btn label="Add" variant="ghost" icon={<Plus size={14} color={c.text2} />} onPress={addGoal} disabled={!newGoal.trim()} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <Btn label="Cancel" variant="ghost" onPress={() => setEditingGoals(false)} />
              <Btn label="Save" onPress={saveGoals} />
            </View>
          </Group>
        ) : userProfile.networkingGoals.length === 0 ? (
          <Text style={[t.secondary, { paddingHorizontal: 4 }]}>No goals yet. Tap Edit to add some.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4 }}>
            {userProfile.networkingGoals.map((g) => (
              <View key={g} style={{ backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentBorder, borderRadius: r.full, paddingHorizontal: 12, paddingVertical: 7 }}>
                <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.accentDeep }}>{g}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View>
        <Label>Settings</Label>
        <Group>
          <Row first>
            <View style={{ flex: 1 }}>
              <Text style={t.body}>Calendar sync</Text>
              <Text style={t.caption}>{calendarStatus}</Text>
            </View>
            {calendarSyncing
              ? <ActivityIndicator color={c.accentDark} />
              : <Switch value={calendarSync} onValueChange={toggleCalendar} trackColor={{ true: c.accentDark, false: c.border }} thumbColor={c.surface} />}
          </Row>
          {calendarSync ? (
            <Row onPress={() => { refreshCalendar().catch(() => {}); }}>
              <View style={{ flex: 1 }}>
                <Text style={[t.body, { color: c.accentDark }]}>Refresh calendar</Text>
                <Text style={t.caption}>{calendarEventCount} {calendarEventCount === 1 ? 'event' : 'events'} from your phone{syncedLabel ? ` · synced ${syncedLabel}` : ''}</Text>
              </View>
              <RefreshCw size={18} color={c.accentDark} />
            </Row>
          ) : null}
          <Row onPress={() => exportContactsCsv(contacts, events).catch(() => {})}>
            <View style={{ flex: 1 }}>
              <Text style={[t.body, { color: c.accentDark }]}>Export contacts as CSV</Text>
              <Text style={t.caption}>{contacts.length} contacts, opens in Excel or Numbers</Text>
            </View>
            <FileDown size={18} color={c.accentDark} />
          </Row>
        </Group>
      </View>
    </View>
  );
}
