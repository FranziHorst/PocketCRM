import React from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Plus, LogCheck, Users, MessageSquare, Bell } from 'lucide-react-native';

const COLORS = {
  primary: '#4F46E5',
  light: '#F9FAFB',
  border: '#E5E7EB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  danger: '#EF4444',
  success: '#10B981',
};

const DashboardScreen = ({ contacts, tasks, notifications, userProfile }) => {
  const overdueCount = contacts?.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    return c.nextReminderDate <= today;
  }).length || 0;

  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const pendingTasks = tasks?.filter(t => !t.completed).length || 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.greeting}>Good evening, {userProfile?.name || 'Alex'}! 👋</Text>
        <Text style={styles.subtext}>Reflect on today's connections and prepare for tomorrow.</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{overdueCount}</Text>
            <Text style={styles.statLabel}>Due Contacts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{contacts?.length || 0}</Text>
            <Text style={styles.statLabel}>Total Network</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn}>
          <Plus size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Users size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Add Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MessageSquare size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Ask AI</Text>
        </TouchableOpacity>
      </View>

      {/* Due Contacts */}
      {overdueCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📌 Contact Reminders Due ({overdueCount})</Text>
          {contacts?.slice(0, 3).map(contact => (
            <View key={contact.id} style={styles.contactItem}>
              <View style={[styles.avatar, { backgroundColor: contact.avatarColor || COLORS.primary }]}>
                <Text style={styles.avatarText}>{contact.name[0]}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRole}>{contact.role} at {contact.company}</Text>
              </View>
              <TouchableOpacity style={styles.logBtn}>
                <Text style={styles.logBtnText}>Log</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Today's Tasks */}
      {pendingTasks > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✓ Today's Tasks ({pendingTasks} pending)</Text>
          {tasks?.filter(t => !t.completed).slice(0, 3).map(task => (
            <View key={task.id} style={styles.taskItem}>
              <TouchableOpacity style={styles.checkbox} />
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.contactName && (
                  <Text style={styles.taskContact}>@{task.contactName}</Text>
                )}
              </View>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: task.priority === 'high' ? '#FEE2E2' : '#FEF3C7' }
              ]}>
                <Text style={[
                  styles.priorityText,
                  { color: task.priority === 'high' ? COLORS.danger : '#92400E' }
                ]}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
    padding: 16,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#E0E7FF',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  taskContact: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default DashboardScreen;
