import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Calendar, Check, CheckCircle2, Circle, Clock, MessageSquare, Plus, Sparkles, TrendingUp, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCrm } from '../store';
import { getGreeting, getReminderInfo } from '../../crmHelpers';
import { c, r, priorityColors, reminderColors } from '../theme';
import { Avatar, Badge, Btn, Card, SectionTitle } from './ui';

export function DashboardView() {
  const { userProfile, contacts, tasks, notifications, toggleTask, setAddTaskOpen, openAddContact, openContact, logTouchpoint, dismissNotification, askAIWithPrompt } = useCrm();
  const router = useRouter();
  const greeting = getGreeting(userProfile.name.split(' ')[0]);

  const urgentContacts = contacts.filter((ct) => {
    const s = getReminderInfo(ct).status;
    return s === 'overdue' || s === 'today';
  });
  const pendingTasks = tasks.filter((t) => !t.completed);
  const unread = notifications.filter((n) => !n.read);

  return (
    <View style={{ gap: 18, paddingBottom: 24 }}>
      <LinearGradient colors={[c.indigo900, c.indigo800, c.slate900]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: r.xl, padding: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: c.indigo200, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
          {greeting.icon}  Personal CRM • {userProfile.age} yo Networker
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: c.white }}>{greeting.text}</Text>
        <Text style={{ fontSize: 12, color: c.indigo100, marginTop: 4 }}>{greeting.subtext}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(67,56,202,0.5)' }}>
          {[
            { l: 'Pending Tasks', v: pendingTasks.length, col: c.white },
            { l: 'Due Contacts', v: urgentContacts.length, col: c.amber300 },
            { l: 'Total Network', v: contacts.length, col: c.emerald300 },
          ].map((m) => (
            <View key={m.l} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: r.lg, padding: 10 }}>
              <Text style={{ fontSize: 11, color: c.indigo200, fontWeight: '500' }}>{m.l}</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: m.col }}>{m.v}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Btn label="Add Task" variant="soft" icon={<Plus size={14} color={c.indigo700} />} onPress={() => setAddTaskOpen(true)} />
        <Btn label="Add Contact" variant="ghost" icon={<UserPlus size={14} color={c.slate700} />} onPress={openAddContact} />
        <Btn label="Ask AI Copilot" variant="violet" icon={<Sparkles size={14} color={c.violet600} />} onPress={() => router.replace('/(tabs)/aichat')} />
        <Btn label="Reminders" variant="ghost" icon={<Clock size={14} color={c.slate700} />} onPress={() => router.replace('/(tabs)/contacts')} />
      </ScrollView>

      {urgentContacts.length > 0 && (
        <View style={{ backgroundColor: c.amber50, borderWidth: 1, borderColor: c.amber200, borderRadius: r.xl, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.amber500 }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: c.amber900, textTransform: 'uppercase', letterSpacing: 1 }}>Contact Reminders Due ({urgentContacts.length})</Text>
            </View>
            <Pressable onPress={() => router.replace('/(tabs)/contacts')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: c.amber900 }}>View All</Text>
              <ArrowRight size={12} color={c.amber900} />
            </Pressable>
          </View>
          <View style={{ gap: 8 }}>
            {urgentContacts.slice(0, 2).map((ct) => {
              const rem = getReminderInfo(ct);
              return (
                <View key={ct.id} style={{ backgroundColor: c.white, borderRadius: r.lg, padding: 12, borderWidth: 1, borderColor: c.amber200, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable onPress={() => openContact(ct)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Avatar name={ct.name} color={ct.avatarColor} size={32} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: c.slate900 }}>{ct.name}</Text>
                        <Badge label={rem.label} colors={reminderColors(rem.status, rem.daysDifference)} />
                      </View>
                      <Text style={{ fontSize: 11, color: c.slate500 }} numberOfLines={1}>{ct.role} at {ct.company}</Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => logTouchpoint(ct.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: r.md, backgroundColor: c.slate100 }}>
                    <Check size={12} color={c.emerald600} />
                    <Text style={{ fontSize: 11, fontWeight: '500', color: c.slate700 }}>Log</Text>
                  </Pressable>
                  <Pressable onPress={() => askAIWithPrompt(`Draft a friendly follow-up message to ${ct.name} (${ct.role} at ${ct.company}) referencing our previous discussion: "${ct.notes}". Keep it natural and ready to send via LinkedIn or WhatsApp.`)} style={{ padding: 6, borderRadius: r.md, backgroundColor: c.indigo50 }}>
                    <MessageSquare size={14} color={c.indigo700} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <Card>
        <SectionTitle
          icon={<Calendar size={16} color={c.indigo600} />}
          right={
            <Pressable onPress={() => setAddTaskOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Plus size={14} color={c.indigo600} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.indigo600 }}>Add</Text>
            </Pressable>
          }>
          Today's Tasks ({pendingTasks.length} pending)
        </SectionTitle>
        {tasks.length === 0 ? (
          <Text style={{ textAlign: 'center', paddingVertical: 20, color: c.slate400, fontSize: 12 }}>No daily tasks yet. Tap "+ Add" to create one.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {tasks.map((task) => (
              <View key={task.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: r.lg, borderWidth: 1, borderColor: c.slate200, backgroundColor: task.completed ? c.slate50 : c.white, opacity: task.completed ? 0.6 : 1 }}>
                <Pressable onPress={() => toggleTask(task.id)} hitSlop={8} style={{ marginTop: 1 }}>
                  {task.completed ? <CheckCircle2 size={16} color={c.emerald600} /> : <Circle size={16} color={c.slate400} />}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: task.completed ? c.slate400 : c.slate900, textDecorationLine: task.completed ? 'line-through' : 'none' }}>{task.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {task.contactName ? (
                      <View style={{ backgroundColor: c.indigo50, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: '500', color: c.indigo700 }}>@{task.contactName}</Text>
                      </View>
                    ) : null}
                    <Badge label={task.priority.toUpperCase()} colors={priorityColors(task.priority)} small />
                    <Text style={{ fontSize: 10, color: c.slate400 }}>{task.dueDate}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle
          icon={<TrendingUp size={16} color={c.indigo600} />}
          right={unread.length > 0 ? (
            <View style={{ backgroundColor: c.rose100, borderRadius: r.full, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.rose700 }}>{unread.length} new</Text>
            </View>
          ) : undefined}>
          Notifications & Insights
        </SectionTitle>
        {notifications.length === 0 ? (
          <Text style={{ textAlign: 'center', paddingVertical: 14, color: c.slate400, fontSize: 12 }}>You're all caught up on notifications!</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {notifications.slice(0, 3).map((n) => (
              <View key={n.id} style={{ padding: 10, borderRadius: r.lg, backgroundColor: c.slate50, borderWidth: 1, borderColor: c.slate100, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: c.slate900, flexShrink: 1 }} numberOfLines={1}>{n.title}</Text>
                    <Text style={{ fontSize: 10, color: c.slate400 }}>{n.date}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: c.slate600, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>{n.message}</Text>
                </View>
                <Pressable onPress={() => dismissNotification(n.id)} hitSlop={8} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 12, color: c.slate400 }}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}
