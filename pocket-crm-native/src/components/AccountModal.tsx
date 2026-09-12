import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { useCrm } from '../store';
import { UserProfile } from '../../types';
import { c, r } from '../theme';
import { Btn, Field, ModalShell } from './ui';

export function AccountModal() {
  const { isAccountOpen, setAccountOpen, updateProfile } = useCrm();
  const router = useRouter();
  if (!isAccountOpen) return null;
  return <Form onClose={() => setAccountOpen(false)} onCreate={(p) => { updateProfile(p); router.replace('/(tabs)/profile'); }} />;
}

function Form({ onClose, onCreate }: { onClose: () => void; onCreate: (p: UserProfile) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('31');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onCreate({
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      age: Number(age) || 31,
      jobTitle: jobTitle.trim() || 'Independent Networker',
      company: company.trim() || 'Self-Employed',
      location: location.trim() || 'Global / Remote',
      bio: bio.trim() || 'Passionate connector creating meaningful professional and personal relationships.',
      networkingGoals: ['Expanding Network', 'Coffee Chats', 'Peer Knowledge Share'],
      socialLinks: { linkedin: linkedin.trim() || undefined, twitter: twitter.trim() || undefined },
      avatarColor: 'bg-indigo-600',
      joinedDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <ModalShell
      visible
      onClose={onClose}
      title="Create User Profile"
      subtitle="Setup your personal pocket CRM account"
      icon={<View style={{ width: 32, height: 32, borderRadius: r.lg, backgroundColor: c.indigo600, alignItems: 'center', justifyContent: 'center' }}><UserPlus size={16} color={c.white} /></View>}
      footer={
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Btn label="Cancel" variant="ghost" onPress={onClose} />
          <Btn label="Create Account" onPress={submit} disabled={!name.trim()} />
        </View>
      }>
      <Field label="Full Name *" value={name} onChangeText={setName} placeholder="e.g., Jordan Blake" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="jordan@network.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
      <Field label="Role / Title" value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Angel Scout" />
      <Field label="Company" value={company} onChangeText={setCompany} placeholder="e.g. Acme Ventures" />
      <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. San Francisco, CA" />
      <Field label="Bio / Networking Philosophy" value={bio} onChangeText={setBio} multiline placeholder="What are your goals? e.g., Connect with climate founders..." />
      <Field label="LinkedIn URL" value={linkedin} onChangeText={setLinkedin} placeholder="LinkedIn URL" autoCapitalize="none" />
      <Field label="X / Twitter handle" value={twitter} onChangeText={setTwitter} placeholder="X / Twitter handle" autoCapitalize="none" />
    </ModalShell>
  );
}
