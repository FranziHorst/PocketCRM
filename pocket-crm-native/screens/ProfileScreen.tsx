import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { LogOut, RotateCcw } from 'lucide-react-native';

const COLORS = {
  primary: '#4F46E5',
  light: '#F9FAFB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
};

const ProfileScreen = ({ userProfile = {} }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={[styles.largeAvatar, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.largeAvatarText}>{userProfile.name?.[0] || 'A'}</Text>
        </View>
        <Text style={styles.name}>{userProfile.name || 'Your Name'}</Text>
        <Text style={styles.subtitle}>{userProfile.jobTitle || 'Job Title'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userProfile.email || 'email@example.com'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Company</Text>
          <Text style={styles.value}>{userProfile.company || 'Your Company'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{userProfile.location || 'Your Location'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button}>
          <RotateCcw size={18} color={COLORS.danger} />
          <Text style={[styles.buttonText, { color: COLORS.danger }]}>Reset Demo Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
          <LogOut size={18} color={COLORS.danger} />
          <Text style={[styles.buttonText, { color: COLORS.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;
