import React from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { Mic, QrCode } from 'lucide-react-native';
import { useCrm } from '../store';
import { c, r } from '../theme';

export function AddContactCard() {
  const { setScanOpen } = useCrm();

  // TODO(Sprache): Aufnahme + Feldzuordnung folgt; bis dahin nur ein Hinweis.
  const speakToAI = () => {
    const msg = 'Speak to AI is coming next: describe who you met and the assistant fills in the contact.';
    if (Platform.OS === 'web') window.alert(msg); else Alert.alert('Coming soon', msg);
  };

  return (
    <View style={{ backgroundColor: c.accent, borderRadius: r.xxl, padding: 20, gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.4, color: c.text }}>Just met someone?</Text>
        <Text style={{ fontSize: 14, color: c.text2, lineHeight: 20 }}>Capture them before the details fade.</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={speakToAI} style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: r.full, backgroundColor: c.text, opacity: pressed ? 0.85 : 1 })}>
          <Mic size={17} color={c.onDark} />
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.onDark }}>Speak to AI</Text>
        </Pressable>
        <Pressable onPress={() => setScanOpen(true)} style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: r.full, backgroundColor: pressed ? c.line : c.surface })}>
          <QrCode size={17} color={c.text} />
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>Scan QR</Text>
        </Pressable>
      </View>
    </View>
  );
}
