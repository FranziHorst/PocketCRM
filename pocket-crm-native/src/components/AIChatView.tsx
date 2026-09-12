import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Bot, Check, Copy, RefreshCw, RotateCcw, Send, Sparkles, User } from 'lucide-react-native';
import { useCrm } from '../store';
import { ChatMessage, Contact } from '../../types';
import { askAssistant, findContactInText, iceBreakersFor } from '../ai';
import { c, r } from '../theme';
import { Avatar } from './ui';

const ICE_BREAKER_PROMPT = 'Ice breaker for a contact';
const SAMPLE_PROMPTS = [
  ICE_BREAKER_PROMPT,
  'Draft a coffee follow-up for Maya Lin',
  'Who in my network is overdue for a check-in?',
  'Prep 3 smart questions for an angel investor',
];

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function AIChatView() {
  const { userProfile, contacts, tasks, events, chatPrefilledPrompt, clearPrefilledPrompt, iceBreakerContactId, clearIceBreakerRequest } = useCrm();
  const welcome = (): ChatMessage => ({
    id: 'm_welcome',
    sender: 'assistant',
    text: `Hey ${userProfile.name.split(' ')[0]}! I'm your AI Assistant. I know your ${contacts.length} contacts, your daily tasks, and who's due for a follow-up. Ask me to draft messages, review contacts, or prep for meetings!`,
    timestamp: 'Just now',
  });
  const [messages, setMessages] = useState<ChatMessage[]>([welcome()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (chatPrefilledPrompt) { setInput(chatPrefilledPrompt); clearPrefilledPrompt(); }
  }, [chatPrefilledPrompt]);

  useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50); }, [messages, loading]);

  const pushUser = (text: string) => setMessages((m) => [...m, { id: `usr_${Date.now()}`, sender: 'user', text, timestamp: 'Just now' }]);

  const askWhichContact = () =>
    setMessages((m) => [...m, { id: `pick_${Date.now()}`, sender: 'assistant', kind: 'pickContact', text: 'Who are you meeting? Pick a contact and I\'ll suggest a few openers based on what you know about them.', timestamp: 'Just now' }]);

  const runIceBreaker = async (contact: Contact, seed = 0) => {
    if (seed === 0) pushUser(`Ice breaker for ${contact.name}`);
    setLoading(true);
    await wait(600);
    const lines = iceBreakersFor(contact, events, seed);
    setMessages((m) => [...m, {
      id: `ice_${Date.now()}`, sender: 'assistant', kind: 'iceBreakers', contactId: contact.id, seed,
      text: `Openers for ${contact.name.split(' ')[0]}:\n\n${lines.map((l) => `• ${l}`).join('\n\n')}\n\n(Demo reply – real AI not connected yet.)`,
      timestamp: 'Just now',
    }]);
    setLoading(false);
  };

  useEffect(() => {
    if (!iceBreakerContactId) return;
    const ct = contacts.find((x) => x.id === iceBreakerContactId);
    clearIceBreakerRequest();
    if (ct) runIceBreaker(ct);
  }, [iceBreakerContactId]);

  const send = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;
    setInput('');
    if (/ice[\s-]?breaker|opener/i.test(text)) {
      const ct = findContactInText(text, contacts);
      if (ct) { await runIceBreaker(ct); return; }
      if (text === ICE_BREAKER_PROMPT || !/mixer|event|meetup/i.test(text)) { pushUser(text); askWhichContact(); return; }
    }
    pushUser(text);
    setLoading(true);
    try {
      const reply = await askAssistant(text, { userProfile, contacts, tasks });
      setMessages((m) => [...m, { id: `ast_${Date.now()}`, sender: 'assistant', text: reply, timestamp: 'Just now' }]);
    } catch {
      setMessages((m) => [...m, { id: `err_${Date.now()}`, sender: 'assistant', text: "Sorry, I couldn't reach the AI service.", timestamp: 'Just now' }]);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, id: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} style={{ flex: 1, backgroundColor: c.slate50 }}>
      <View style={{ backgroundColor: c.white, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.slate200, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: c.violet600, alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color={c.white} />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.slate900 }}>AI Assistant</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.emerald500 }} />
              <Text style={{ fontSize: 10, fontWeight: '500', color: c.emerald600 }}>CRM Enabled • Demo mode</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={() => setMessages([{ id: 'm_welcome', sender: 'assistant', text: 'Chat reset! How can I help you strengthen your relationships today?', timestamp: 'Just now' }])} style={{ padding: 6 }}>
          <RotateCcw size={14} color={c.slate400} />
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 12 }} keyboardShouldPersistTaps="handled">
        {messages.map((msg) => {
          const me = msg.sender === 'user';
          return (
            <View key={msg.id} style={{ flexDirection: me ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: me ? c.indigo600 : c.violet600, alignItems: 'center', justifyContent: 'center' }}>
                {me ? <User size={14} color={c.white} /> : <Bot size={14} color={c.white} />}
              </View>
              <View style={{ maxWidth: '82%', borderRadius: r.xl, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: me ? c.indigo600 : c.white, borderWidth: me ? 0 : 1, borderColor: c.slate200, gap: 6 }}>
                <Text style={{ fontSize: 12, lineHeight: 18, color: me ? c.white : c.slate800 }}>{msg.text}</Text>
                {msg.kind === 'pickContact' && <ContactPicker contacts={contacts} onPick={(ct) => runIceBreaker(ct)} disabled={loading} />}
                {!me && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: c.slate100 }}>
                    <Text style={{ fontSize: 11, color: c.slate400 }}>{msg.timestamp}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {msg.kind === 'iceBreakers' && msg.contactId ? (
                      <Pressable onPress={() => { const ct = contacts.find((x) => x.id === msg.contactId); if (ct) runIceBreaker(ct, (msg.seed ?? 0) + 1); }} disabled={loading} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <RefreshCw size={13} color={c.violet600} />
                        <Text style={{ fontSize: 11, fontWeight: '600', color: c.violet600 }}>Another one</Text>
                      </Pressable>
                    ) : null}
                    <Pressable onPress={() => copy(msg.text, msg.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {copiedId === msg.id ? <Check size={14} color={c.emerald600} /> : <Copy size={14} color={c.slate400} />}
                      <Text style={{ fontSize: 11, fontWeight: copiedId === msg.id ? '600' : '400', color: copiedId === msg.id ? c.emerald600 : c.slate400 }}>{copiedId === msg.id ? 'Copied' : 'Copy'}</Text>
                    </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })}
        {loading && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 36 }}>
            <ActivityIndicator size="small" color={c.violet600} />
            <Text style={{ fontSize: 12, color: c.slate400 }}>AI Assistant is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.slate100 }} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
        {SAMPLE_PROMPTS.map((p) => (
          <Pressable key={p} onPress={() => send(p)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: r.full, backgroundColor: c.slate100 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: c.slate600 }}>{p}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.slate200 }}>
        <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => send()} placeholder="Ask about your network, draft follow-ups..." placeholderTextColor={c.slate400} style={{ flex: 1, backgroundColor: c.slate100, borderWidth: 1, borderColor: c.slate200, borderRadius: r.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 12, color: c.slate900 }} />
        <Pressable onPress={() => send()} disabled={!input.trim() || loading} style={{ padding: 10, borderRadius: r.lg, backgroundColor: c.indigo600, opacity: !input.trim() || loading ? 0.4 : 1 }}>
          <Send size={16} color={c.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function ContactPicker({ contacts, onPick, disabled }: { contacts: Contact[]; onPick: (ct: Contact) => void; disabled?: boolean }) {
  const [q, setQ] = useState('');
  const shown = q.trim() ? contacts.filter((ct) => `${ct.name} ${ct.company}`.toLowerCase().includes(q.trim().toLowerCase())) : contacts;
  return (
    <View style={{ gap: 8, marginTop: 4 }}>
      {contacts.length > 8 ? (
        <TextInput value={q} onChangeText={setQ} placeholder="Search contacts…" placeholderTextColor={c.slate400} style={{ backgroundColor: c.slate50, borderWidth: 1, borderColor: c.slate200, borderRadius: r.md, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: c.slate900 }} />
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {shown.map((ct) => (
          <Pressable key={ct.id} onPress={() => onPick(ct)} disabled={disabled} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.slate50, borderWidth: 1, borderColor: c.slate200, borderRadius: r.full, paddingLeft: 4, paddingRight: 10, paddingVertical: 4, opacity: disabled ? 0.5 : 1 }}>
            <Avatar name={ct.name} color={ct.avatarColor} size={22} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: c.slate800 }}>{ct.name}</Text>
          </Pressable>
        ))}
        {shown.length === 0 ? <Text style={{ fontSize: 11, color: c.slate400 }}>No matches</Text> : null}
      </View>
    </View>
  );
}
