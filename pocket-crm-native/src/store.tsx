import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Contact, DailyTask, AppNotification } from '../types';
import {
  initialUserProfile,
  initialContacts,
  initialDailyTasks,
  initialNotifications,
} from '../mockData';

const KEYS = {
  profile: 'pocket_crm_user_profile',
  contacts: 'pocket_crm_contacts',
  tasks: 'pocket_crm_tasks',
  notifications: 'pocket_crm_notifications',
} as const;

type CrmState = {
  userProfile: UserProfile;
  contacts: Contact[];
  tasks: DailyTask[];
  notifications: AppNotification[];
};

const CrmContext = createContext<CrmState | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [tasks, setTasks] = useState<DailyTask[]>(initialDailyTasks);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, t, n] = await Promise.all([
          AsyncStorage.getItem(KEYS.profile),
          AsyncStorage.getItem(KEYS.contacts),
          AsyncStorage.getItem(KEYS.tasks),
          AsyncStorage.getItem(KEYS.notifications),
        ]);
        if (p) setUserProfile(JSON.parse(p));
        if (c) setContacts(JSON.parse(c));
        if (t) setTasks(JSON.parse(t));
        if (n) setNotifications(JSON.parse(n));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEYS.profile, JSON.stringify(userProfile));
    AsyncStorage.setItem(KEYS.contacts, JSON.stringify(contacts));
    AsyncStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
    AsyncStorage.setItem(KEYS.notifications, JSON.stringify(notifications));
  }, [ready, userProfile, contacts, tasks, notifications]);

  return (
    <CrmContext.Provider value={{ userProfile, contacts, tasks, notifications }}>
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used inside CrmProvider');
  return ctx;
}
