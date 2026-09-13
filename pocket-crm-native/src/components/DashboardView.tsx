import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Calendar, CheckCircle2, Circle, CloudSun, Moon, Plus, Sun, TrendingUp } from 'lucide-react-native';
import { useCrm } from '../store';
import { getGreeting } from '../../crmHelpers';
import { c, r, priorityColors } from '../theme';
import { Badge, Card, SectionTitle } from './ui';
import { AddContactCard } from './AddContactCard';

export function DashboardView() {
  const { userProfile, contacts, tasks, notifications, toggleTask, setAddTaskOpen, dismissNotification } = useCrm();
  const greeting = getGreeting(userProfile.name.split(' ')[0]);
  const hour = new Date().getHours();
  const GreetIcon = hour >= 5 && hour < 12 ? Sun : hour >= 12 && hour < 18 ? CloudSun : Moon;

  const pendingTasks = tasks.filter((t) => !t.completed);
  const unread = notifications.filter((n) => !n.read);

  return (
    <View style={{ gap: 18, paddingBottom: 24 }}>
      <View style={{ backgroundColor: c.text, borderRadius: r.xxl, padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <GreetIcon size={16} color={c.accent} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: c.onDarkSoft, textTransform: 'uppercase', letterSpacing: 1 }}>Personal CRM</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: c.onDark }}>{greeting.text}</Text>
        <Text style={{ fontSize: 13, color: c.onDarkSoft, marginTop: 4 }}>{greeting.subtext}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(253,251,247,0.12)' }}>
          {[
            { l: 'Pending Tasks', v: pendingTasks.length, col: c.onDark },
            { l: 'Total Network', v: contacts.length, col: c.accent },
          ].map((m) => (
            <View key={m.l} style={{ flex: 1, backgroundColor: 'rgba(253,251,247,0.08)', borderRadius: r.xl, padding: 12 }}>
              <Text style={{ fontSize: 11, color: c.onDarkSoft, fontWeight: '500' }}>{m.l}</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: m.col }}>{m.v}</Text>
            </View>
          ))}
        </View>
      </View>

      <AddContactCard />

      <Card>
        <SectionTitle
          icon={<Calendar size={16} color={c.accent} />}
          right={
            <Pressable onPress={() => setAddTaskOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Plus size={14} color={c.accent} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.accent }}>Add</Text>
            </Pressable>
          }>
          Today's Tasks ({pendingTasks.length} pending)
        </SectionTitle>
        {tasks.length === 0 ? (
          <Text style={{ textAlign: 'center', paddingVertical: 20, color: c.textMuted, fontSize: 12 }}>No daily tasks yet. Tap "+ Add" to create one.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {tasks.map((task) => (
              <View key={task.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: r.lg, borderWidth: 1, borderColor: c.border, backgroundColor: task.completed ? c.surfaceSoft : c.surface, opacity: task.completed ? 0.6 : 1 }}>
                <Pressable onPress={() => toggleTask(task.id)} hitSlop={8} style={{ marginTop: 1 }}>
                  {task.completed ? <CheckCircle2 size={16} color={c.accentDark} /> : <Circle size={16} color={c.textMuted} />}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: task.completed ? c.textMuted : c.text, textDecorationLine: task.completed ? 'line-through' : 'none' }}>{task.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {task.contactName ? (
                      <View style={{ backgroundColor: c.accentSoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: '500', color: c.accentDark }}>@{task.contactName}</Text>
                      </View>
                    ) : null}
                    <Badge label={task.priority.toUpperCase()} colors={priorityColors(task.priority)} small />
                    <Text style={{ fontSize: 10, color: c.textMuted }}>{task.dueDate}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle
          icon={<TrendingUp size={16} color={c.accent} />}
          right={unread.length > 0 ? (
            <View style={{ backgroundColor: c.dangerSoft, borderRadius: r.full, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.dangerDark }}>{unread.length} new</Text>
            </View>
          ) : undefined}>
          Notifications & Insights
        </SectionTitle>
        {notifications.length === 0 ? (
          <Text style={{ textAlign: 'center', paddingVertical: 14, color: c.textMuted, fontSize: 12 }}>You're all caught up on notifications!</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {notifications.slice(0, 3).map((n) => (
              <View key={n.id} style={{ padding: 10, borderRadius: r.lg, backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: c.text, flexShrink: 1 }} numberOfLines={1}>{n.title}</Text>
                    <Text style={{ fontSize: 10, color: c.textMuted }}>{n.date}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>{n.message}</Text>
                </View>
                <Pressable onPress={() => dismissNotification(n.id)} hitSlop={8} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 12, color: c.textMuted }}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}
