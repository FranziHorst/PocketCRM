import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import { useCrm } from '../store';
import { extractContactWithAI, type ExtractedContact } from '../ai';
import type { CrmEvent } from '../../types';
import { createRecognizer, isSpeechSupported, unsupportedReason, type Recognizer } from '../speech';
import { c, r, font } from '../theme';
import { Btn, Label, ModalShell } from './ui';

export function SpeakToAIModal() {
  const { isSpeakOpen, setSpeakOpen, openAddContact, events, addManualEvent } = useCrm();
  if (!isSpeakOpen) return null;
  return (
    <SpeakSheet
      events={events}
      onClose={() => setSpeakOpen(false)}
      onResult={(extracted) => {
        const eventId = extracted.eventId ?? (extracted.newEventName ? addManualEvent(extracted.newEventName).id : undefined);
        setSpeakOpen(false);
        openAddContact({ name: extracted.name, role: extracted.role, company: extracted.company, howWeMet: extracted.howWeMet, notes: extracted.notes, location: extracted.location, eventId });
      }}
    />
  );
}

function SpeakSheet({ events, onClose, onResult }: { events: CrmEvent[]; onClose: () => void; onResult: (extracted: ExtractedContact) => void }) {
  const supported = isSpeechSupported();
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [extracting, setExtracting] = useState(false);
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

  // Die KI ordnet erst beim Weiter zu - ein Aufruf pro Notiz, nicht pro Tastendruck.
  const continueWithAI = async () => {
    if (listening) stop();
    setError(null);
    setExtracting(true);
    try {
      onResult(await extractContactWithAI(text, events));
    } finally {
      setExtracting(false);
    }
  };

  return (
    <ModalShell
      visible
      onClose={onClose}
      title="Speak to AI"
      subtitle={listening ? 'Listening — describe who you met' : 'Describe who you just met'}
      icon={<Mic size={16} color={c.accentDark} />}
      footer={
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Btn label="Cancel" variant="ghost" onPress={onClose} disabled={extracting} />
          <Btn
            label={extracting ? 'Understanding…' : 'Continue'}
            icon={extracting ? <ActivityIndicator size="small" color={c.onDark} /> : undefined}
            onPress={continueWithAI}
            disabled={!text.trim() || extracting}
          />
        </View>
      }>
      <View style={{ gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Pressable
            onPress={listening ? stop : start}
            disabled={!supported || extracting}
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
            editable={!listening && !extracting}
            multiline
            placeholder="e.g. I met Sarah Miller at the SaaStr conference, she's a product designer at Figma"
            placeholderTextColor={c.textMuted}
            style={{
              backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: listening ? c.accentBorder : c.border,
              borderRadius: r.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text,
              minHeight: 96, textAlignVertical: 'top', fontFamily: font.regular,
            }}
          />
          <Text style={{ fontSize: 11, color: c.textSecondary, fontFamily: font.regular, marginTop: 6 }}>
            Check the text, then continue. The AI fills in the contact form from it; you can fix anything there.
          </Text>
        </View>

        {error ? (
          <Text style={{ fontSize: 11, color: c.danger, backgroundColor: c.dangerSoft, padding: 8, borderRadius: r.md, fontFamily: font.regular }}>{error}</Text>
        ) : null}
      </View>
    </ModalShell>
  );
}
