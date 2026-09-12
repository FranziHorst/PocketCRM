import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle2, Circle, Plus, TrendingUp } from 'lucide-react-native';
import { useCrm } from '../store';
import { getGreeting } from '../../crmHelpers';
import { c, r, priorityColors } from '../theme';
import { Badge, Card, SectionTitle } from './ui';
import { AddContactCard } from './AddContactCard';

export function DashboardView() {
  const { userProfile, contacts, tasks, notifications, toggleTask, setAddTaskOpen, dismissNotification } = useCrm();
  const greeting = getGreeting(userProfile.name.split(' ')[0]);

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
            { l: 'Total Network', v: contacts.length, col: c.emerald300 },
          ].map((m) => (
            <View key={m.l} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: r.lg, padding: 10 }}>
              <Text style={{ fontSize: 11, color: c.indigo200, fontWeight: '500' }}>{m.l}</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: m.col }}>{m.v}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <AddContactCard />

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
