import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Bot, Check, Copy, RefreshCw, RotateCcw, Send, Sparkles, User } from 'lucide-react-native';
import { useCrm } from '../store';
import { ChatMessage, Contact } from '../../types';
import { askAssistant, findContactInText, iceBreakersFor } from '../ai';
import { c, r, font } from '../theme';
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ backgroundColor: c.surface, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: c.accentDark, alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color={c.onDark} />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontFamily: font.display, color: c.text }}>AI Assistant</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
              <Text style={{ fontSize: 10, fontFamily: font.medium, color: c.accentDark }}>CRM Enabled • Demo mode</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={() => setMessages([{ id: 'm_welcome', sender: 'assistant', text: 'Chat reset! How can I help you strengthen your relationships today?', timestamp: 'Just now' }])} style={{ padding: 6 }}>
          <RotateCcw size={14} color={c.textMuted} />
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 12 }} keyboardShouldPersistTaps="handled">
        {messages.map((msg) => {
          const me = msg.sender === 'user';
          return (
            <View key={msg.id} style={{ flexDirection: me ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: me ? c.text : c.accentDark, alignItems: 'center', justifyContent: 'center' }}>
                {me ? <User size={14} color={c.onDark} /> : <Bot size={14} color={c.onDark} />}
              </View>
              <View style={{ maxWidth: '82%', borderRadius: r.xl, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: me ? c.text : c.surface, borderWidth: me ? 0 : 1, borderColor: c.line, gap: 6 }}>
                <Text style={{ fontSize: 13, lineHeight: 19, color: me ? c.onDark : c.text , fontFamily: font.regular}}>{msg.text}</Text>
                {msg.kind === 'pickContact' && <ContactPicker contacts={contacts} onPick={(ct) => runIceBreaker(ct)} disabled={loading} />}
                {!me && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: c.line }}>
                    <Text style={{ fontSize: 11, color: c.textMuted , fontFamily: font.regular}}>{msg.timestamp}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {msg.kind === 'iceBreakers' && msg.contactId ? (
                      <Pressable onPress={() => { const ct = contacts.find((x) => x.id === msg.contactId); if (ct) runIceBreaker(ct, (msg.seed ?? 0) + 1); }} disabled={loading} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <RefreshCw size={13} color={c.accentDark} />
                        <Text style={{ fontSize: 11, fontFamily: font.medium, color: c.accentDark }}>Another one</Text>
                      </Pressable>
                    ) : null}
                    <Pressable onPress={() => copy(msg.text, msg.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {copiedId === msg.id ? <Check size={14} color={c.accentDark} /> : <Copy size={14} color={c.textMuted} />}
                      <Text style={{ fontSize: 12, fontFamily: copiedId === msg.id ? font.medium : font.regular, color: copiedId === msg.id ? c.accentDark : c.textMuted}}>{copiedId === msg.id ? 'Copied' : 'Copy'}</Text>
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
            <ActivityIndicator size="small" color={c.accentDark} />
            <Text style={{ fontSize: 12, color: c.textMuted , fontFamily: font.regular}}>AI Assistant is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line }} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
        {SAMPLE_PROMPTS.map((p) => (
          <Pressable key={p} onPress={() => send(p)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: r.full, backgroundColor: c.line }}>
            <Text style={{ fontSize: 11, fontFamily: font.medium, color: c.textSecondary }}>{p}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border }}>
        <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => send()} placeholder="Ask about your network, draft follow-ups..." placeholderTextColor={c.textMuted} style={{ flex: 1, backgroundColor: c.line, borderWidth: 1, borderColor: c.border, borderRadius: r.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 12, color: c.text }} />
        <Pressable onPress={() => send()} disabled={!input.trim() || loading} style={{ padding: 10, borderRadius: r.full, backgroundColor: c.accentDark, opacity: !input.trim() || loading ? 0.4 : 1 }}>
          <Send size={16} color={c.onDark} />
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
        <TextInput value={q} onChangeText={setQ} placeholder="Search contacts…" placeholderTextColor={c.textMuted} style={{ backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: c.border, borderRadius: r.md, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: c.text , fontFamily: font.regular}} />
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {shown.map((ct) => (
          <Pressable key={ct.id} onPress={() => onPick(ct)} disabled={disabled} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: c.border, borderRadius: r.full, paddingLeft: 4, paddingRight: 10, paddingVertical: 4, opacity: disabled ? 0.5 : 1 }}>
            <Avatar name={ct.name} color={ct.avatarColor} size={22} />
            <Text style={{ fontSize: 12, fontFamily: font.medium, color: c.text }}>{ct.name}</Text>
          </Pressable>
        ))}
        {shown.length === 0 ? <Text style={{ fontSize: 11, color: c.textMuted , fontFamily: font.regular}}>No matches</Text> : null}
      </View>
    </View>
  );
}
