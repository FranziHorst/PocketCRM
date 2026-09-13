import React from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { Mic, QrCode, Sparkles } from 'lucide-react-native';
import { useCrm } from '../store';
import { c, r } from '../theme';
import { Card } from './ui';

export function AddContactCard() {
  const { setScanOpen } = useCrm();

  // TODO(Sprache): Aufnahme + Feldzuordnung folgt; bis dahin nur ein Hinweis.
  const speakToAI = () => {
    const msg = 'Speak to AI is coming next: describe who you met and the copilot fills in the contact.';
    if (Platform.OS === 'web') window.alert(msg); else Alert.alert('Coming soon', msg);
  };

  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: c.accentSoft2, alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={14} color={c.accentDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>Add a contact</Text>
          <Text style={{ fontSize: 11, color: c.textSecondary }}>Just met someone? Capture them in seconds.</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={speakToAI} style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 8, padding: 14, borderRadius: r.xl, backgroundColor: c.accent, opacity: pressed ? 0.9 : 1 })}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(253,251,247,0.55)', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={20} color={c.text} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>Speak to AI</Text>
          <Text style={{ fontSize: 10, color: c.text2, textAlign: 'center' }}>Describe who you met</Text>
        </Pressable>

        <Pressable onPress={() => setScanOpen(true)} style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 8, padding: 14, borderRadius: r.xl, backgroundColor: pressed ? c.line : c.surfaceSoft, borderWidth: 1, borderColor: c.border })}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.text, alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={20} color={c.onDark} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>Scan LinkedIn QR</Text>
          <Text style={{ fontSize: 10, color: c.textSecondary, textAlign: 'center' }}>From their LinkedIn app</Text>
        </Pressable>
      </View>
    </Card>
  );
}
