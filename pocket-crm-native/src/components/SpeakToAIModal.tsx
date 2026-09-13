import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import { useCrm } from '../store';
import { extractContact } from '../ai';
import { createRecognizer, isSpeechSupported, unsupportedReason, type Recognizer } from '../speech';
import { c, r, font } from '../theme';
import { Btn, Label, ModalShell } from './ui';

export function SpeakToAIModal() {
  const { isSpeakOpen, setSpeakOpen, openAddContact } = useCrm();
  if (!isSpeakOpen) return null;
  return (
    <SpeakSheet
      onClose={() => setSpeakOpen(false)}
      onResult={(prefill) => { setSpeakOpen(false); openAddContact(prefill); }}
    />
  );
}

function SpeakSheet({ onClose, onResult }: { onClose: () => void; onResult: (prefill: Parameters<ReturnType<typeof useCrm>['openAddContact']>[0]) => void }) {
  const supported = isSpeechSupported();
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognizer = useRef<Recognizer | null>(null);

  useEffect(() => () => recognizer.current?.stop(), []);

  const stop = () => {
    recognizer.current?.stop();
    setListening(false);
    setInterim('');
  };

  const start = () => {
    setError(null);
    const rec = createRecognizer({
      onTranscript: (final, live) => { setText(final); setInterim(live); },
      onError: (message) => { setError(message); setListening(false); setInterim(''); },
      onEnd: () => { setListening(false); setInterim(''); },
    });
    if (!rec) { setError(unsupportedReason); return; }
    recognizer.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError('Could not start the microphone. Try again.');
    }
  };

  const preview = extractContact(text);
  const fields: { label: string; value: string }[] = [
    { label: 'Name', value: preview.name },
    { label: 'Role', value: preview.role },
    { label: 'Company', value: preview.company },
    { label: 'Met at', value: preview.howWeMet },
  ];
  const found = fields.filter((f) => f.value);

  return (
    <ModalShell
      visible
      onClose={onClose}
      title="Speak to AI"
      subtitle={listening ? 'Listening — describe who you met' : 'Describe who you just met'}
      icon={<Mic size={16} color={c.accentDark} />}
      footer={
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Btn label="Cancel" variant="ghost" onPress={onClose} />
          <Btn label="Continue" onPress={() => onResult(extractContact(text))} disabled={!text.trim()} />
        </View>
      }>
      <View style={{ gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Pressable
            onPress={listening ? stop : start}
            disabled={!supported}
            style={({ pressed }) => ({
              width: 76, height: 76, borderRadius: r.full,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: !supported ? c.surfaceSoft : listening ? c.danger : c.text,
              opacity: pressed ? 0.85 : 1,
            })}>
            {listening ? <Square size={26} color={c.onDark} fill={c.onDark} /> : <Mic size={30} color={!supported ? c.textMuted : c.onDark} />}
          </Pressable>
          <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: font.regular }}>
            {!supported ? 'Microphone unavailable — type below' : listening ? 'Tap to stop' : 'Tap to start talking'}
          </Text>
        </View>

        {!supported ? (
          <Text style={{ fontSize: 11, color: c.textSecondary, fontFamily: font.regular, textAlign: 'center' }}>{unsupportedReason}</Text>
        ) : null}

        <View>
          <Label>What you said</Label>
          <TextInput
            value={listening && interim ? `${text} ${interim}`.trim() : text}
            onChangeText={setText}
            editable={!listening}
            multiline
            placeholder="e.g. I met Sarah Miller at the SaaStr conference, she's a product designer at Figma"
            placeholderTextColor={c.textMuted}
            style={{
              backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: listening ? c.accentBorder : c.border,
              borderRadius: r.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text,
              minHeight: 96, textAlignVertical: 'top', fontFamily: font.regular,
            }}
          />
        </View>

        {found.length ? (
          <View style={{ backgroundColor: c.accentSoft, borderRadius: r.lg, padding: 14, gap: 8 }}>
            <Text style={{ fontSize: 12, fontFamily: font.medium, color: c.accentDeep }}>I picked up</Text>
            {found.map((f) => (
              <View key={f.label} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: font.regular, width: 74 }}>{f.label}</Text>
                <Text style={{ fontSize: 13, color: c.text, fontFamily: font.medium, flex: 1 }}>{f.value}</Text>
              </View>
            ))}
            <Text style={{ fontSize: 11, color: c.textSecondary, fontFamily: font.regular }}>You can fix anything on the next screen.</Text>
          </View>
        ) : null}

        {error ? (
          <Text style={{ fontSize: 11, color: c.danger, backgroundColor: c.dangerSoft, padding: 8, borderRadius: r.md, fontFamily: font.regular }}>{error}</Text>
        ) : null}
      </View>
    </ModalShell>
  );
}
