import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sparkles } from 'lucide-react-native';
import { useCrm } from '../store';
import { c, r } from '../theme';
import { Avatar } from './ui';

export function AppHeader() {
  const { userProfile, unreadCount, setNotificationsOpen } = useCrm();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: c.white, borderBottomWidth: 1, borderBottomColor: c.slate100 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable onPress={() => router.replace('/')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.indigo600, alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color={c.white} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }}>Pocket CRM</Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: c.slate500 }}>Personal Network</Text>
          </View>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pressable onPress={() => setNotificationsOpen(true)} hitSlop={6} style={{ padding: 8, borderRadius: r.full }}>
            <Bell size={16} color={c.slate600} />
            {unreadCount > 0 && (
              <View style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: c.rose500, borderWidth: 2, borderColor: c.white }} />
            )}
          </Pressable>

          <Pressable onPress={() => router.replace('/(tabs)/profile')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4, paddingRight: 8, paddingVertical: 4, borderRadius: r.full }}>
            <Avatar name={userProfile.name} color={userProfile.avatarColor} size={28} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: c.slate700 }}>{userProfile.name.split(' ')[0]}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
