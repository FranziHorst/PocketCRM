import React, { useState } from 'react';
import { Alert, Platform, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { CalendarDays, Camera, FileDown, Pencil, Plus, Target, Trash2, X } from 'lucide-react-native';
import { useCrm } from '../store';
import { UserProfile } from '../../types';
import { exportContactsCsv } from '../csv';
import { c, r } from '../theme';
import { Avatar, Btn, Card, Field, SectionTitle, SocialIcon } from './ui';

export function ProfileView() {
  const { userProfile, contacts, events, updateProfile, calendarSync, setCalendarSync } = useCrm();
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
  const notify = (msg: string) => { if (Platform.OS === 'web') window.alert(msg); else Alert.alert(msg); };

  const sl = userProfile.socialLinks || {};
  const socials = (['linkedin', 'twitter', 'instagram', 'website', 'github'] as const).filter((k) => sl[k]);

  return (
    <View style={{ gap: 14, paddingBottom: 24 }}>
      {editing ? (
        <Card style={{ padding: 20, borderColor: c.indigo500 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }}>Edit profile</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {form.avatarUri ? (
                <Pressable onPress={() => set({ avatarUri: undefined })} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Trash2 size={12} color={c.rose600} />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: c.rose600 }}>Remove photo</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={pickPhoto} accessibilityLabel="Change photo">
                <Avatar name={form.name} color={form.avatarColor} uri={form.avatarUri} size={56} radius={16} />
                <View style={{ position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: c.indigo600, borderWidth: 2, borderColor: c.white, alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={11} color={c.white} />
                </View>
              </Pressable>
            </View>
          </View>
          <Field label="Full Name" value={form.name} onChangeText={(v) => set({ name: v })} />
          <Field label="Age" value={String(form.age || '')} onChangeText={(v) => set({ age: Number(v) || 0 })} keyboardType="number-pad" />
          <Field label="Job Title" value={form.jobTitle} onChangeText={(v) => set({ jobTitle: v })} />
          <Field label="Company" value={form.company} onChangeText={(v) => set({ company: v })} />
          <Field label="Location" value={form.location} onChangeText={(v) => set({ location: v })} />
          <Field label="Email" value={form.email} onChangeText={(v) => set({ email: v })} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Bio & networking intent" value={form.bio} onChangeText={(v) => set({ bio: v })} multiline />

          <Text style={{ fontSize: 12, fontWeight: '700', color: c.slate900, marginBottom: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.slate100 }}>Profiles</Text>
          <Field label="LinkedIn" value={form.socialLinks.linkedin || ''} onChangeText={(v) => setSocial('linkedin', v)} placeholder="LinkedIn profile URL" autoCapitalize="none" />
          <Field label="X / Twitter" value={form.socialLinks.twitter || ''} onChangeText={(v) => setSocial('twitter', v)} placeholder="X / Twitter handle or URL" autoCapitalize="none" />
          <Field label="Instagram" value={form.socialLinks.instagram || ''} onChangeText={(v) => setSocial('instagram', v)} placeholder="Instagram handle or URL" autoCapitalize="none" />
          <Field label="Website" value={form.socialLinks.website || ''} onChangeText={(v) => setSocial('website', v)} placeholder="Website URL" autoCapitalize="none" />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.slate100 }}>
            <Btn label="Cancel" variant="ghost" onPress={() => setEditing(false)} />
            <Btn label="Save" onPress={save} disabled={!form.name.trim()} />
          </View>
        </Card>
      ) : (
        <>
          <Card style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
                <Avatar name={userProfile.name} color={userProfile.avatarColor} uri={userProfile.avatarUri} size={56} radius={16} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.slate900 }}>{userProfile.name}</Text>
                    {userProfile.age ? (
                      <View style={{ backgroundColor: c.indigo50, borderRadius: r.full, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: c.indigo700 }}>Age {userProfile.age}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: c.slate600 }}>{[userProfile.jobTitle, userProfile.company].filter(Boolean).join(' • ')}</Text>
                  <Text style={{ fontSize: 11, color: c.slate400 }}>{[userProfile.location ? `📍 ${userProfile.location}` : '', userProfile.email].filter(Boolean).join(' • ')}</Text>
                </View>
              </View>
              <Pressable onPress={startEdit} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: r.md, backgroundColor: c.indigo50 }}>
                <Pencil size={13} color={c.indigo700} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: c.indigo700 }}>Edit</Text>
              </Pressable>
            </View>
            {userProfile.bio ? (
              <Text style={{ marginTop: 14, fontSize: 12, color: c.slate600, backgroundColor: c.slate50, padding: 12, borderRadius: r.lg, borderWidth: 1, borderColor: c.slate100, lineHeight: 17 }}>{userProfile.bio}</Text>
            ) : null}
            {socials.length > 0 ? (
              <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.slate100, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                {socials.map((k) => <SocialIcon key={k} kind={k} url={sl[k]!} withLabel />)}
              </View>
            ) : null}
          </Card>

        </>
      )}

      <Card style={editingGoals ? { borderColor: c.indigo500 } : undefined}>
        <SectionTitle
          icon={<Target size={16} color={c.indigo600} />}
          right={!editingGoals ? (
            <Pressable onPress={startEditGoals} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: r.md, backgroundColor: c.indigo50 }}>
              <Pencil size={13} color={c.indigo700} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.indigo700 }}>Edit</Text>
            </Pressable>
          ) : <View style={{ height: 28 }} />}>
          Personal Networking Goals
        </SectionTitle>
        {editingGoals ? (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {goals.map((g) => (
                <View key={g} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.indigo50, borderWidth: 1, borderColor: c.indigo200, borderRadius: r.md, paddingLeft: 10, paddingRight: 6, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '500', color: c.indigo800 }}>🎯 {g}</Text>
                  <Pressable onPress={() => setGoals(goals.filter((x) => x !== g))} hitSlop={6}>
                    <X size={12} color={c.indigo400} />
                  </Pressable>
                </View>
              ))}
              {goals.length === 0 ? <Text style={{ fontSize: 12, color: c.slate400 }}>No goals yet.</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput value={newGoal} onChangeText={setNewGoal} onSubmitEditing={addGoal} placeholder="Add a goal, e.g. Meet climate founders" placeholderTextColor={c.slate400} style={{ flex: 1, backgroundColor: c.white, borderWidth: 1, borderColor: c.slate200, borderRadius: r.lg, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: c.slate900 }} />
              <Btn label="Add" variant="ghost" icon={<Plus size={14} color={c.slate700} />} onPress={addGoal} disabled={!newGoal.trim()} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.slate100 }}>
              <Btn label="Cancel" variant="ghost" onPress={() => setEditingGoals(false)} />
              <Btn label="Save" onPress={saveGoals} />
            </View>
          </View>
        ) : userProfile.networkingGoals.length === 0 ? (
          <Text style={{ fontSize: 12, color: c.slate400 }}>No goals yet. Tap Edit to add some.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {userProfile.networkingGoals.map((g) => (
              <View key={g} style={{ backgroundColor: c.indigo50, borderWidth: 1, borderColor: c.indigo200, borderRadius: r.md, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '500', color: c.indigo800 }}>🎯 {g}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.emerald50, alignItems: 'center', justifyContent: 'center' }}>
            <CalendarDays size={16} color={c.emerald700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }}>Calendar sync</Text>
            <Text style={{ fontSize: 11, color: c.slate500 }}>Events from your calendar show up under Contacts → Events</Text>
          </View>
          <Switch value={calendarSync} onValueChange={setCalendarSync} trackColor={{ true: c.emerald500, false: c.slate200 }} thumbColor={c.white} />
        </View>
        <Text style={{ fontSize: 11, color: c.slate500, lineHeight: 16, backgroundColor: c.slate50, padding: 10, borderRadius: r.lg, borderWidth: 1, borderColor: c.slate100 }}>
          Coming soon: new contacts are linked to the event you're at, and you'll see which people from your network are going to the same events. The events shown today are demo data.
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.slate100, alignItems: 'center', justifyContent: 'center' }}>
            <FileDown size={16} color={c.slate700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }}>Export contacts</Text>
            <Text style={{ fontSize: 11, color: c.slate500 }}>{contacts.length} contacts as a CSV file for Excel, Numbers or another CRM</Text>
          </View>
        </View>
        <Btn label="Export CSV" variant="ghost" icon={<FileDown size={16} color={c.slate700} />} onPress={() => exportContactsCsv(contacts, events).catch(() => {})} />
      </Card>

    </View>
  );
}
