import React, { useState } from 'react';
import { Alert, Platform, Pressable, Share, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Download, Edit3, Plus, RotateCcw, Target } from 'lucide-react-native';
import { useCrm } from '../store';
import { UserProfile } from '../../types';
import { c, r } from '../theme';
import { Avatar, Btn, Card, Field, SectionTitle, SocialIcon, confirmAsync } from './ui';

export function ProfileView() {
  const { userProfile, contacts, updateProfile, setAccountOpen, resetDemoData } = useCrm();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>({ ...userProfile, socialLinks: { ...userProfile.socialLinks } });
  const set = (patch: Partial<UserProfile>) => setForm((f) => ({ ...f, ...patch }));
  const setSocial = (key: keyof UserProfile['socialLinks'], v: string) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: v } }));
  const sl = userProfile.socialLinks || {};

  const exportData = async () => {
    const json = JSON.stringify({ userProfile, contacts, exportedAt: new Date().toISOString() }, null, 2);
    try {
      await Share.share({ message: json, title: 'Pocket CRM export' });
    } catch {
      await Clipboard.setStringAsync(json);
      if (Platform.OS === 'web') window.alert('Export copied to clipboard.'); else Alert.alert('Export copied to clipboard.');
    }
  };

  return (
    <View style={{ gap: 14, paddingBottom: 24 }}>
      <Card style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
            <Avatar name={userProfile.name} color={userProfile.avatarColor} size={56} radius={16} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: c.slate900 }}>{userProfile.name}</Text>
                <View style={{ backgroundColor: c.indigo50, borderRadius: r.full, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: c.indigo700 }}>Age {userProfile.age}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '500', color: c.slate600 }}>{userProfile.jobTitle} • {userProfile.company}</Text>
              <Text style={{ fontSize: 11, color: c.slate400 }}>📍 {userProfile.location} • {userProfile.email}</Text>
            </View>
          </View>
          <Pressable onPress={() => { setForm({ ...userProfile, socialLinks: { ...userProfile.socialLinks } }); setIsEditing(!isEditing); }} style={{ padding: 8, borderRadius: r.lg, backgroundColor: isEditing ? c.indigo50 : 'transparent' }}>
            <Edit3 size={16} color={isEditing ? c.indigo600 : c.slate600} />
          </Pressable>
        </View>
        {userProfile.bio ? (
          <Text style={{ marginTop: 14, fontSize: 12, color: c.slate600, backgroundColor: c.slate50, padding: 12, borderRadius: r.lg, borderWidth: 1, borderColor: c.slate100, lineHeight: 17 }}>{userProfile.bio}</Text>
        ) : null}
        <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.slate100, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: c.slate500 }}>Socials:</Text>
          {sl.linkedin ? <SocialIcon kind="linkedin" url={sl.linkedin} withLabel /> : null}
          {sl.twitter ? <SocialIcon kind="twitter" url={sl.twitter} withLabel /> : null}
          {sl.instagram ? <SocialIcon kind="instagram" url={sl.instagram} withLabel /> : null}
          {sl.website ? <SocialIcon kind="website" url={sl.website} withLabel /> : null}
          {sl.github ? <SocialIcon kind="github" url={sl.github} withLabel /> : null}
        </View>
      </Card>

      <Card>
        <SectionTitle icon={<Target size={16} color={c.indigo600} />}>Personal Networking Goals</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {userProfile.networkingGoals.map((g) => (
            <View key={g} style={{ backgroundColor: c.indigo50, borderWidth: 1, borderColor: c.indigo200, borderRadius: r.md, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '500', color: c.indigo800 }}>🎯 {g}</Text>
            </View>
          ))}
        </View>
      </Card>

      {isEditing && (
        <Card style={{ borderWidth: 2, borderColor: c.indigo500 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: c.slate200 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.slate900 }}>Edit My Profile Information</Text>
            <Text style={{ fontSize: 11, color: c.slate500 }}>Update persona & social links</Text>
          </View>
          <Field label="Full Name" value={form.name} onChangeText={(v) => set({ name: v })} />
          <Field label="Age" value={String(form.age)} onChangeText={(v) => set({ age: Number(v) || 0 })} keyboardType="number-pad" />
          <Field label="Job Title" value={form.jobTitle} onChangeText={(v) => set({ jobTitle: v })} />
          <Field label="Company" value={form.company} onChangeText={(v) => set({ company: v })} />
          <Field label="Location" value={form.location} onChangeText={(v) => set({ location: v })} />
          <Field label="Bio & Networking Intent" value={form.bio} onChangeText={(v) => set({ bio: v })} multiline />
          <Text style={{ fontSize: 12, fontWeight: '700', color: c.slate800, marginBottom: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.slate200 }}>Social Media Connections</Text>
          <Field label="LinkedIn" value={form.socialLinks.linkedin || ''} onChangeText={(v) => setSocial('linkedin', v)} placeholder="LinkedIn profile URL" autoCapitalize="none" />
          <Field label="X / Twitter" value={form.socialLinks.twitter || ''} onChangeText={(v) => setSocial('twitter', v)} placeholder="X / Twitter handle or URL" autoCapitalize="none" />
          <Field label="Instagram" value={form.socialLinks.instagram || ''} onChangeText={(v) => setSocial('instagram', v)} placeholder="Instagram handle or URL" autoCapitalize="none" />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.slate200 }}>
            <Btn label="Cancel" variant="ghost" onPress={() => setIsEditing(false)} />
            <Btn label="Save Profile" onPress={() => { updateProfile(form); setIsEditing(false); }} />
          </View>
        </Card>
      )}

      <Card style={{ gap: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }}>User Account Management</Text>
        <Text style={{ fontSize: 12, color: c.slate500, lineHeight: 17 }}>Manage your personal CRM identity, create a new profile from scratch, or export your network records.</Text>
        <Btn label="Create New User Profile" variant="soft" icon={<Plus size={16} color={c.indigo700} />} onPress={() => setAccountOpen(true)} />
        <Btn label="Export Network (JSON)" variant="ghost" icon={<Download size={16} color={c.slate700} />} onPress={exportData} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: c.slate100 }}>
          <Text style={{ fontSize: 11, color: c.slate400 }}>Prototype Demo Persona (31yo Networker)</Text>
          <Pressable onPress={async () => { if (await confirmAsync('Reset to default sample contacts and tasks?')) resetDemoData(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <RotateCcw size={12} color={c.slate500} />
            <Text style={{ fontSize: 11, fontWeight: '500', color: c.slate500 }}>Reset Demo Data</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}
