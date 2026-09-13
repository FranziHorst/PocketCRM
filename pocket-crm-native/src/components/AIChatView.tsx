import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { ArrowUp, Check, Copy, Globe, RefreshCw, Sparkles } from 'lucide-react-native';
import { useCrm } from '../store';
import { ChatMessage, Contact } from '../../types';
import { AssistantAction, askAssistant, findContactInText, geminiConfigured, iceBreakersFor } from '../ai';
import { WebSource } from '../gemini';
import { c, r, t, font } from '../theme';
import { Avatar, PageTitle, TextBtn } from './ui';

type Msg = ChatMessage & {
  action?: AssistantAction;
  actionState?: 'pending' | 'applied' | 'dismissed';
  sources?: WebSource[];
};

const ICE_BREAKER_PROMPT = 'Ice breaker for a contact';
const SAMPLE_PROMPTS = [
  ICE_BREAKER_PROMPT,
  'Who in my network is overdue for a check-in?',
  "What's new at Maya Lin's company?",
  'Remind me to follow up with Maya Lin on Friday',
  'Prep 3 smart questions for an angel investor',
];

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function AIChatView() {
  const {
    userProfile, contacts, tasks, events, saveContact, addTask, toggleTask,
    chatPrefilledPrompt, clearPrefilledPrompt, iceBreakerContactId, clearIceBreakerRequest,
  } = useCrm();
  const live = geminiConfigured();
  const welcome = (): Msg => ({
    id: 'm_welcome',
    sender: 'assistant',
    text: live
      ? `Hi ${userProfile.name.split(' ')[0]}. I know your ${contacts.length} contacts and your open tasks, I can search the web, and I can add tasks or update a contact for you — you confirm before anything is saved.`
      : `Hi ${userProfile.name.split(' ')[0]}. I know your ${contacts.length} contacts and your open tasks. Ask me for an opener before a meeting, a follow-up draft, or who you haven't spoken to in a while.`,
    timestamp: '',
  });
  const [messages, setMessages] = useState<Msg[]>([welcome()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (chatPrefilledPrompt) { setInput(chatPrefilledPrompt); clearPrefilledPrompt(); }
  }, [chatPrefilledPrompt]);

  useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50); }, [messages, loading]);

  const pushUser = (text: string) => setMessages((m) => [...m, { id: `usr_${Date.now()}`, sender: 'user', text, timestamp: '' }]);

  const askWhichContact = () =>
    setMessages((m) => [...m, { id: `pick_${Date.now()}`, sender: 'assistant', kind: 'pickContact', text: 'Who are you meeting? Pick a contact and I\'ll suggest a few openers based on what you know about them.', timestamp: '' }]);

  const runIceBreaker = async (contact: Contact, seed = 0) => {
    if (seed === 0) pushUser(`Ice breaker for ${contact.name}`);
    setLoading(true);
    let text: string;
    if (live) {
      const reply = await askAssistant(
        `Give me three openers to start a conversation with ${contact.name}. Look them up first and build each one on something specific you find. Just the three lines${seed > 0 ? ', different from the usual ones' : ''}.`,
        { userProfile, contacts, tasks, events }
      );
      text = reply.text;
    } else {
      await wait(600);
      const lines = iceBreakersFor(contact, events, seed);
      text = `Openers for ${contact.name.split(' ')[0]}:\n\n${lines.map((l) => `• ${l}`).join('\n\n')}\n\n(Demo reply, real AI not connected yet.)`;
    }
    setMessages((m) => [...m, {
      id: `ice_${Date.now()}`, sender: 'assistant', kind: 'iceBreakers', contactId: contact.id, seed, text, timestamp: '',
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
    const history = messages.filter((m) => m.id !== 'm_welcome').map((m) => ({ sender: m.sender, text: m.text }));
    pushUser(text);
    setLoading(true);
    try {
      const reply = await askAssistant(text, { userProfile, contacts, tasks, events }, history);
      setMessages((m) => [...m, {
        id: `ast_${Date.now()}`, sender: 'assistant', text: reply.text, timestamp: '',
        ...(reply.action ? { action: reply.action, actionState: 'pending' as const } : {}),
        ...(reply.sources?.length ? { sources: reply.sources } : {}),
      }]);
    } catch {
      setMessages((m) => [...m, { id: `err_${Date.now()}`, sender: 'assistant', text: "Sorry, I couldn't reach the AI service.", timestamp: '' }]);
    } finally {
      setLoading(false);
    }
  };

  const resolveAction = (msgId: string, apply: boolean) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.action || msg.actionState !== 'pending') return;
    if (apply) {
      const a = msg.action;
      if (a.kind === 'saveContact') saveContact(a.contact);
      else if (a.kind === 'addTask') addTask(a.task);
      else toggleTask(a.taskId);
    }
    setMessages((m) => m.map((x) => (x.id === msgId ? { ...x, actionState: apply ? 'applied' : 'dismissed' } : x)));
  };

  const copy = async (text: string, id: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const reset = () => setMessages([{ id: 'm_welcome', sender: 'assistant', text: 'Fresh start. What do you need?', timestamp: '' }]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingHorizontal: 20 }}>
        <PageTitle title="Assistant" subtitle="Knows your contacts and tasks" right={messages.length > 1 ? <TextBtn label="Clear" onPress={reset} /> : undefined} />
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 12 }} keyboardShouldPersistTaps="handled">
        {messages.map((msg) => {
          const me = msg.sender === 'user';
          return (
            <View key={msg.id} style={{ alignItems: me ? 'flex-end' : 'flex-start' }}>
              <View style={{ maxWidth: '86%', borderRadius: r.xxl, borderBottomRightRadius: me ? 6 : r.xxl, borderBottomLeftRadius: me ? r.xxl : 6, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: me ? c.text : c.surface, gap: 8 }}>
                <Text style={{ fontSize: 15, lineHeight: 21, fontFamily: font.regular, color: me ? c.onDark : c.text }}>{msg.text}</Text>
                {msg.kind === 'pickContact' && <ContactPicker contacts={contacts} onPick={(ct) => runIceBreaker(ct)} disabled={loading} />}
                {msg.action ? (
                  <ActionCard action={msg.action} state={msg.actionState ?? 'pending'} onResolve={(apply) => resolveAction(msg.id, apply)} />
                ) : null}
                {msg.sources?.length ? <Sources sources={msg.sources} /> : null}
                {!me && msg.id !== 'm_welcome' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.line }}>
                    {msg.kind === 'iceBreakers' && msg.contactId ? (
                      <Pressable onPress={() => { const ct = contacts.find((x) => x.id === msg.contactId); if (ct) runIceBreaker(ct, (msg.seed ?? 0) + 1); }} disabled={loading} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <RefreshCw size={13} color={c.accentDark} />
                        <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.accentDark }}>Another one</Text>
                      </Pressable>
                    ) : null}
                    <Pressable onPress={() => copy(msg.text, msg.id)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      {copiedId === msg.id ? <Check size={13} color={c.accentDark} /> : <Copy size={13} color={c.textSecondary} />}
                      <Text style={{ fontSize: 13, fontFamily: font.medium, color: copiedId === msg.id ? c.accentDark : c.textSecondary }}>{copiedId === msg.id ? 'Copied' : 'Copy'}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          );
        })}
        {loading && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
            <ActivityIndicator size="small" color={c.accentDark} />
            <Text style={t.secondary}>Thinking…</Text>
          </View>
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8, gap: 8 }}>
        {SAMPLE_PROMPTS.map((p) => (
          <Pressable key={p} onPress={() => send(p)} style={({ pressed }) => ({ paddingHorizontal: 14, paddingVertical: 8, borderRadius: r.full, backgroundColor: pressed ? c.line : c.surface, borderWidth: 1, borderColor: c.line })}>
            <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.text2 }}>{p}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 }}>
        <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => send()} placeholder="Ask about your network" placeholderTextColor={c.textMuted} style={{ flex: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: r.full, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, fontFamily: font.regular, color: c.text }} />
        <Pressable onPress={() => send()} disabled={!input.trim() || loading} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: c.text, opacity: !input.trim() || loading ? 0.35 : pressed ? 0.85 : 1 })}>
          <ArrowUp size={20} color={c.onDark} strokeWidth={2.4} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function ActionCard({ action, state, onResolve }: { action: AssistantAction; state: 'pending' | 'applied' | 'dismissed'; onResolve: (apply: boolean) => void }) {
  if (state !== 'pending') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <Check size={13} color={state === 'applied' ? c.accentDark : c.textMuted} />
        <Text style={{ fontSize: 13, fontFamily: font.medium, color: state === 'applied' ? c.accentDark : c.textMuted }}>
          {state === 'applied' ? 'Saved' : 'Not saved'}
        </Text>
      </View>
    );
  }
  return (
    <View style={{ marginTop: 4, borderRadius: r.lg, borderWidth: 1, borderColor: c.line, backgroundColor: c.surfaceSoft, padding: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Sparkles size={15} color={c.accentDark} />
        <Text style={{ flex: 1, fontSize: 14, lineHeight: 19, fontFamily: font.medium, color: c.text }}>{action.label}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={() => onResolve(true)} style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 8, borderRadius: r.full, backgroundColor: c.text, opacity: pressed ? 0.85 : 1 })}>
          <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.onDark }}>Save</Text>
        </Pressable>
        <Pressable onPress={() => onResolve(false)} style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 8, borderRadius: r.full, borderWidth: 1, borderColor: c.line, backgroundColor: pressed ? c.line : 'transparent' })}>
          <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.text2 }}>Discard</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Sources({ sources }: { sources: WebSource[] }) {
  return (
    <View style={{ marginTop: 4, gap: 6 }}>
      {sources.slice(0, 4).map((s) => (
        <Pressable key={s.uri} onPress={() => Linking.openURL(s.uri).catch(() => {})} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Globe size={12} color={c.textSecondary} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 12, fontFamily: font.regular, color: c.textSecondary, textDecorationLine: 'underline' }}>{s.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ContactPicker({ contacts, onPick, disabled }: { contacts: Contact[]; onPick: (ct: Contact) => void; disabled?: boolean }) {
  const [q, setQ] = useState('');
  const shown = q.trim() ? contacts.filter((ct) => `${ct.name} ${ct.company}`.toLowerCase().includes(q.trim().toLowerCase())) : contacts;
  return (
    <View style={{ gap: 8, marginTop: 4 }}>
      {contacts.length > 8 ? (
        <TextInput value={q} onChangeText={setQ} placeholder="Search contacts" placeholderTextColor={c.textMuted} style={{ backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: c.line, borderRadius: r.lg, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, fontFamily: font.regular, color: c.text }} />
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {shown.map((ct) => (
          <Pressable key={ct.id} onPress={() => onPick(ct)} disabled={disabled} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: pressed ? c.line : c.surfaceSoft, borderWidth: 1, borderColor: c.line, borderRadius: r.full, paddingLeft: 4, paddingRight: 12, paddingVertical: 4, opacity: disabled ? 0.5 : 1 })}>
            <Avatar name={ct.name} color={ct.avatarColor} size={26} />
            <Text style={{ fontSize: 14, fontFamily: font.medium, color: c.text }}>{ct.name}</Text>
          </Pressable>
        ))}
        {shown.length === 0 ? <Text style={t.caption}>No matches</Text> : null}
      </View>
    </View>
  );
}
