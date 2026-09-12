import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Calendar, CheckCircle2, Circle, Clock, CloudSun, Moon, Plus, Sparkles, Sun } from 'lucide-react-native';
import { useCrm } from '../store';
import { getGreeting } from '../../crmHelpers';
import { DailyTask } from '../../types';
import { c, r, priorityColors } from '../theme';
import { Badge, Card } from './ui';

export function OpeningPageView({ embedded }: { embedded?: boolean }) {
  const { userProfile, tasks, toggleTask, addTask, goToMainApp } = useCrm();
  const [quickTitle, setQuickTitle] = useState('');

  const firstName = userProfile.name.split(' ')[0] || 'there';
  const greeting = getGreeting(firstName);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const GreetIcon = hour >= 5 && hour < 12 ? Sun : hour >= 12 && hour < 18 ? CloudSun : Moon;

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || (!t.completed && t.dueDate < todayStr));
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const pendingCount = todayTasks.length - completedCount;

  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return;
    const task: DailyTask = { id: `task_${Date.now()}`, title: quickTitle.trim(), dueDate: todayStr, completed: false, priority: 'high', type: 'follow-up' };
    addTask(task);
    setQuickTitle('');
  };

  return (
    <View style={{ flex: 1, padding: embedded ? 0 : 20, justifyContent: 'space-between' }}>
      {!embedded && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: c.slate100 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: c.indigo600, alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color={c.white} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.slate900 }}>Pocket CRM</Text>
          </View>
          <Pressable onPress={goToMainApp} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: r.full, backgroundColor: c.slate100 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: c.slate600 }}>Main App</Text>
            <ArrowRight size={14} color={c.slate600} />
          </Pressable>
        </View>
      )}

      <View style={{ paddingVertical: 20, gap: 18 }}>
        <View style={{ gap: 6 }}>
          <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.indigo50, paddingHorizontal: 10, paddingVertical: 4, borderRadius: r.full }}>
            <Calendar size={14} color={c.indigo600} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: c.indigo600 }}>{formattedDate}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 }}>
            <GreetIcon size={20} color={hour >= 18 || hour < 5 ? c.indigo400 : c.amber500} />
            <Text style={{ fontSize: 24, fontWeight: '700', color: c.slate900 }}>{greeting.text}</Text>
          </View>
          <Text style={{ fontSize: 13, color: c.slate500 }}>
            {pendingCount > 0
              ? `You have ${pendingCount} task${pendingCount > 1 ? 's' : ''} scheduled for today. Here is your daily focus:`
              : "You are all caught up on today's tasks! Ready to explore your network."}
          </Text>
        </View>

        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: c.slate100 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color={c.indigo600} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.slate900 }}>Tasks for Today</Text>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '600', color: c.slate500 }}>{completedCount} of {todayTasks.length} done</Text>
          </View>

          <View style={{ gap: 8 }}>
            {todayTasks.length === 0 ? (
              <Text style={{ textAlign: 'center', paddingVertical: 20, color: c.slate400, fontSize: 12 }}>No tasks scheduled for today. Add one below!</Text>
            ) : (
              todayTasks.map((task) => (
                <View key={task.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: r.lg, borderWidth: 1, borderColor: c.slate200, backgroundColor: task.completed ? c.slate50 : c.white, opacity: task.completed ? 0.6 : 1 }}>
                  <Pressable onPress={() => toggleTask(task.id)} hitSlop={8} style={{ marginTop: 1 }}>
                    {task.completed ? <CheckCircle2 size={16} color={c.emerald600} /> : <Circle size={16} color={c.slate400} />}
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: task.completed ? c.slate400 : c.slate800, textDecorationLine: task.completed ? 'line-through' : 'none' }}>{task.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Badge label={task.priority.toUpperCase()} colors={priorityColors(task.priority)} small />
                      {task.contactName ? <Text style={{ fontSize: 10, fontWeight: '600', color: c.indigo600 }}>@{task.contactName}</Text> : null}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.slate100 }}>
            <TextInput
              value={quickTitle}
              onChangeText={setQuickTitle}
              onSubmitEditing={handleQuickAdd}
              placeholder="Add another task for today..."
              placeholderTextColor={c.slate400}
              style={{ flex: 1, backgroundColor: c.slate50, borderWidth: 1, borderColor: c.slate200, borderRadius: r.lg, paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, color: c.slate900 }}
            />
            <Pressable onPress={handleQuickAdd} disabled={!quickTitle.trim()} style={{ padding: 8, borderRadius: r.lg, backgroundColor: c.indigo600, opacity: quickTitle.trim() ? 1 : 0.4 }}>
              <Plus size={16} color={c.white} />
            </Pressable>
          </View>
        </Card>
      </View>

      <View style={{ paddingTop: 14, borderTopWidth: 1, borderTopColor: c.slate100 }}>
        <Pressable onPress={goToMainApp}>
          <LinearGradient colors={[c.indigo600, c.indigo700]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: r.xl }}>
            <View>
              <Text style={{ fontSize: 12, color: c.indigo200, fontWeight: '500' }}>Ready to explore your network?</Text>
              <Text style={{ fontSize: 14, color: c.white, fontWeight: '700' }}>Go to Main App</Text>
            </View>
            <View style={{ width: 40, height: 40, borderRadius: r.lg, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={20} color={c.white} />
            </View>
          </LinearGradient>
        </Pressable>
        <Text style={{ textAlign: 'center', fontSize: 11, color: c.slate400, marginTop: 8 }}>Tap the arrow to open full CRM contacts, cadences, and AI copilot</Text>
      </View>
    </View>
  );
}
