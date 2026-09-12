import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowRight, Bell } from 'lucide-react-native';
import { useCrm } from '../store';
import { c, r } from '../theme';
import { ModalShell } from './ui';

export function NotificationsModal() {
  const { isNotificationsOpen, setNotificationsOpen, notifications, dismissNotification, clearAllNotifications, contacts, openContact } = useCrm();
  const close = () => setNotificationsOpen(false);

  return (
    <ModalShell
      visible={isNotificationsOpen}
      onClose={close}
      title="Notifications & Reminders"
      icon={<Bell size={16} color={c.indigo600} />}
      footer={notifications.length > 0 ? (
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Pressable onPress={clearAllNotifications}><Text style={{ fontSize: 12, fontWeight: '600', color: c.slate500 }}>Clear All Notifications</Text></Pressable>
        </View>
      ) : undefined}>
      {notifications.length === 0 ? (
        <Text style={{ textAlign: 'center', paddingVertical: 28, color: c.slate400, fontSize: 12 }}>No notifications right now.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {notifications.map((n) => {
            const ct = n.contactId ? contacts.find((x) => x.id === n.contactId) : undefined;
            return (
              <View key={n.id} style={{ padding: 12, backgroundColor: c.slate50, borderRadius: r.lg, borderWidth: 1, borderColor: c.slate100, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: c.slate900, flex: 1 }}>{n.title}</Text>
                  <Text style={{ fontSize: 10, color: c.slate400 }}>{n.date}</Text>
                </View>
                <Text style={{ fontSize: 11, color: c.slate600, lineHeight: 16 }}>{n.message}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                  {ct ? (
                    <Pressable onPress={() => { close(); openContact(ct); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: c.indigo600 }}>View Contact</Text>
                      <ArrowRight size={12} color={c.indigo600} />
                    </Pressable>
                  ) : <View />}
                  <Pressable onPress={() => dismissNotification(n.id)}><Text style={{ fontSize: 11, color: c.slate400 }}>Dismiss</Text></Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ModalShell>
  );
}
