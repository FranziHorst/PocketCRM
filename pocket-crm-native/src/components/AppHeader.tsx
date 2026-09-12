import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { c } from '../theme';

export function AppHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: c.white, borderBottomWidth: 1, borderBottomColor: c.slate100 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable onPress={() => router.replace('/')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.indigo600, alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color={c.white} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }}>Pocket CRM</Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: c.slate500 }}>Personal Network</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
