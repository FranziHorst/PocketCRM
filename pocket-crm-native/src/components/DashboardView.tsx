import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CheckCircle2, Circle, Plus, Sparkles, X } from 'lucide-react-native';
import { useCrm } from '../store';
import { getGreeting } from '../../crmHelpers';
import { c, r, t, font, priorityColors } from '../theme';
import { Badge, Group, Row, SectionHeader, TextBtn } from './ui';
import { AddContactCard } from './AddContactCard';

export function DashboardView() {
  const { userProfile, contacts, tasks, notifications, toggleTask, setAddTaskOpen, dismissNotification } = useCrm();
  const greeting = getGreeting(userProfile.name.split(' ')[0]);
  const pending = tasks.filter((x) => !x.completed);
  const unread = notifications.filter((n) => !n.read);

  return (
    <View style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: -6 }}>
        <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: c.accentDark, alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={13} color={c.onDark} />
        </View>
        <Text style={{ fontSize: 15, fontFamily: font.display, letterSpacing: -0.2, color: c.text }}>Pocket CRM</Text>
      </View>

      <View style={{ backgroundColor: c.text, borderRadius: r.xxl, padding: 22, gap: 18 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 27, fontFamily: font.display, letterSpacing: -0.4, color: c.onDark }}>{greeting.text.replace(/!$/, '')}</Text>
          <Text style={{ fontSize: 14, color: c.onDarkSoft, lineHeight: 20 , fontFamily: font.regular}}>{greeting.subtext}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat value={pending.length} label={pending.length === 1 ? 'Open task' : 'Open tasks'} />
          <Stat value={contacts.length} label={contacts.length === 1 ? 'Contact' : 'Contacts'} />
        </View>
      </View>

      <AddContactCard />

      <View>
        <SectionHeader title="Today" right={<TextBtn label="Add" icon={<Plus size={16} color={c.accentDark} />} onPress={() => setAddTaskOpen(true)} />} />
        <Group>
          {tasks.length === 0 ? (
            <Text style={[t.secondary, { paddingVertical: 18, textAlign: 'center' }]}>Nothing planned. Add a task to get started.</Text>
          ) : tasks.map((task, i) => (
            <Row key={task.id} first={i === 0} onPress={() => toggleTask(task.id)} style={{ alignItems: 'flex-start' }}>
              <View style={{ marginTop: 1 }}>
                {task.completed ? <CheckCircle2 size={22} color={c.accentDark} /> : <Circle size={22} color={c.borderStrong} />}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[t.body, task.completed && { color: c.textMuted, textDecorationLine: 'line-through' }]}>{task.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {task.contactName ? <Text style={t.caption}>{task.contactName}</Text> : null}
                  {!task.completed && task.priority === 'high' ? <Badge label="High" colors={priorityColors('high')} small /> : null}
                  <Text style={t.caption}>{task.dueDate}</Text>
                </View>
              </View>
            </Row>
          ))}
        </Group>
      </View>

      <View>
        <SectionHeader title="Notifications" right={unread.length > 0 ? <Text style={[t.caption, { color: c.accentDark }]}>{unread.length} new</Text> : undefined} />
        <Group>
          {notifications.length === 0 ? (
            <Text style={[t.secondary, { paddingVertical: 18, textAlign: 'center' }]}>You're all caught up.</Text>
          ) : notifications.slice(0, 3).map((n, i) => (
            <Row key={n.id} first={i === 0} style={{ alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={[t.bodyStrong, { flex: 1 }]} numberOfLines={1}>{n.title}</Text>
                  <Text style={t.caption}>{n.date}</Text>
                </View>
                <Text style={t.secondary} numberOfLines={2}>{n.message}</Text>
              </View>
              <Pressable onPress={() => dismissNotification(n.id)} hitSlop={10} style={{ padding: 4, marginTop: 2 }}>
                <X size={16} color={c.textMuted} />
              </Pressable>
            </Row>
          ))}
        </Group>
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(253,251,247,0.08)', borderRadius: r.xl, paddingVertical: 12, paddingHorizontal: 14, gap: 2 }}>
      <Text style={{ fontSize: 28, fontFamily: font.display, letterSpacing: -0.6, color: c.onDark }}>{value}</Text>
      <Text style={{ fontSize: 12, fontFamily: font.medium, color: c.onDarkSoft }}>{label}</Text>
    </View>
  );
}
