import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

const COLORS = {
  primary: '#4F46E5',
  light: '#F9FAFB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

const TodayScreen = ({ userProfile = {}, tasks = [] }) => {
  const pendingTasks = tasks.filter(t => !t.completed) || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good evening, {userProfile.name || 'Alex'}! 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      <View style={styles.focusCard}>
        <Text style={styles.focusTitle}>Today's Focus</Text>
        <Text style={styles.focusCount}>{pendingTasks.length} tasks to complete</Text>
        <Text style={styles.focusSubtext}>Reflect on today's connections and prepare for tomorrow.</Text>
      </View>

      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Tasks for Today</Text>
        {pendingTasks.length > 0 ? (
          pendingTasks.map(task => (
            <TouchableOpacity key={task.id} style={styles.taskCard}>
              <View style={styles.taskCheck} />
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.title}</Text>
                <Text style={styles.taskDetail}>{task.contactName}</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noTasks}>No tasks for today. Great job! 🎉</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  focusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  focusCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
  },
  focusSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  tasksSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  taskCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  taskDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  noTasks: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 40,
  },
});

export default TodayScreen;
