import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Bot, Check, Copy, RotateCcw, Send, Sparkles, User } from 'lucide-react-native';
import { useCrm } from '../store';
import { ChatMessage } from '../../types';
import { askAssistant } from '../ai';
import { c, r } from '../theme';

const SAMPLE_PROMPTS = [
  'Draft a coffee follow-up for Maya Lin',
  'Who in my network is overdue for a check-in?',
  'Prep 3 smart questions for an angel investor',
  'Suggest icebreakers for a tech founder mixer',
];

export function AIChatView() {
  const { userProfile, contacts, tasks, chatPrefilledPrompt, clearPrefilledPrompt } = useCrm();
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

  const send = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { id: `usr_${Date.now()}`, sender: 'user', text, timestamp: 'Just now' }]);
    setInput('');
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} style={{ flex: 1, backgroundColor: c.slate50, borderRadius: r.xl, borderWidth: 1, borderColor: c.slate200, overflow: 'hidden' }}>
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
                {!me && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: c.slate100 }}>
                    <Text style={{ fontSize: 11, color: c.slate400 }}>{msg.timestamp}</Text>
                    <Pressable onPress={() => copy(msg.text, msg.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {copiedId === msg.id ? <Check size={14} color={c.emerald600} /> : <Copy size={14} color={c.slate400} />}
                      <Text style={{ fontSize: 11, fontWeight: copiedId === msg.id ? '600' : '400', color: copiedId === msg.id ? c.emerald600 : c.slate400 }}>{copiedId === msg.id ? 'Copied' : 'Copy'}</Text>
                    </Pressable>
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
