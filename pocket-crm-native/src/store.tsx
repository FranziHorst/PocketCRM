import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { UserProfile, Contact, DailyTask, AppNotification } from '../types';
import { initialUserProfile, initialContacts, initialDailyTasks, initialNotifications } from '../mockData';
import { calculateNextReminder, getReminderInfo } from '../crmHelpers';

const KEYS = {
  profile: 'pocket_crm_user_profile',
  contacts: 'pocket_crm_contacts',
  tasks: 'pocket_crm_tasks',
  notifications: 'pocket_crm_notifications',
} as const;

type Store = {
  ready: boolean;
  userProfile: UserProfile;
  contacts: Contact[];
  tasks: DailyTask[];
  notifications: AppNotification[];
  overdueCount: number;
  unreadCount: number;

  toggleTask: (taskId: string) => void;
  addTask: (task: DailyTask) => void;
  saveContact: (contact: Contact) => void;
  deleteContact: (contactId: string) => void;
  logTouchpoint: (contactId: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateProfile: (profile: UserProfile) => void;
  resetDemoData: () => void;

  selectedContact: Contact | null;
  openContact: (contact: Contact) => void;
  openAddContact: () => void;
  closeContact: () => void;
  isAddTaskOpen: boolean;
  setAddTaskOpen: (open: boolean) => void;
  isAccountOpen: boolean;
  setAccountOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;

  chatPrefilledPrompt: string;
  clearPrefilledPrompt: () => void;
  askAIWithPrompt: (prompt: string) => void;
  askAIForContact: (contact: Contact) => void;

  goToOpeningPage: () => void;
  goToMainApp: () => void;
};

const CrmContext = createContext<Store | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [tasks, setTasks] = useState<DailyTask[]>(initialDailyTasks);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [chatPrefilledPrompt, setChatPrefilledPrompt] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [p, ct, t, n] = await Promise.all([
          AsyncStorage.getItem(KEYS.profile),
          AsyncStorage.getItem(KEYS.contacts),
          AsyncStorage.getItem(KEYS.tasks),
          AsyncStorage.getItem(KEYS.notifications),
        ]);
        if (p) setUserProfile(JSON.parse(p));
        if (ct) setContacts(JSON.parse(ct));
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

  const overdueCount = useMemo(
    () =>
      contacts.filter((ct) => {
        const s = getReminderInfo(ct).status;
        return s === 'overdue' || s === 'today';
      }).length,
    [contacts]
  );
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const toggleTask = (taskId: string) =>
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));

  const addTask = (task: DailyTask) => setTasks((prev) => [task, ...prev]);

  const saveContact = (contact: Contact) =>
    setContacts((prev) =>
      prev.some((ct) => ct.id === contact.id)
        ? prev.map((ct) => (ct.id === contact.id ? contact : ct))
        : [contact, ...prev]
    );

  const deleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((ct) => ct.id !== contactId));
    if (selectedContact?.id === contactId) setSelectedContact(null);
  };

  const logTouchpoint = (contactId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setContacts((prev) =>
      prev.map((ct) =>
        ct.id === contactId
          ? { ...ct, lastContacted: today, nextReminderDate: calculateNextReminder(ct.reminderCadence) }
          : ct
      )
    );
    setTasks((prev) =>
      prev.map((t) => (t.contactId === contactId && t.type === 'follow-up' ? { ...t, completed: true } : t))
    );
  };

  const dismissNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAllNotifications = () => setNotifications([]);
  const updateProfile = (profile: UserProfile) => setUserProfile(profile);

  const resetDemoData = () => {
    setUserProfile(initialUserProfile);
    setContacts(initialContacts);
    setTasks(initialDailyTasks);
    setNotifications(initialNotifications);
  };

  const openContact = (contact: Contact) => setSelectedContact(contact);
  const closeContact = () => setSelectedContact(null);
  const openAddContact = () =>
    setSelectedContact({
      id: `c_${Date.now()}`,
      name: '',
      role: '',
      company: '',
      howWeMet: '',
      notes: '',
      tags: ['New Contact'],
      socialLinks: {},
      reminderCadence: 'biweekly',
      lastContacted: new Date().toISOString().split('T')[0],
      nextReminderDate: calculateNextReminder('biweekly'),
      avatarColor: 'bg-indigo-600',
    });

  const goToOpeningPage = () => router.replace('/');
  const goToMainApp = () => router.replace('/(tabs)/dashboard');

  const askAIWithPrompt = (prompt: string) => {
    setChatPrefilledPrompt(prompt);
    setSelectedContact(null);
    router.replace('/(tabs)/aichat');
  };
  const askAIForContact = (contact: Contact) =>
    askAIWithPrompt(
      `Give me 3 strategic follow-up talking points or a warm message draft for ${contact.name} (${contact.role} at ${contact.company}). Meeting context: "${contact.howWeMet}". Notes: "${contact.notes}".`
    );
  const clearPrefilledPrompt = () => setChatPrefilledPrompt('');

  const value: Store = {
    ready, userProfile, contacts, tasks, notifications, overdueCount, unreadCount,
    toggleTask, addTask, saveContact, deleteContact, logTouchpoint,
    dismissNotification, clearAllNotifications, updateProfile, resetDemoData,
    selectedContact, openContact, openAddContact, closeContact,
    isAddTaskOpen, setAddTaskOpen, isAccountOpen, setAccountOpen,
    isNotificationsOpen, setNotificationsOpen,
    chatPrefilledPrompt, clearPrefilledPrompt, askAIWithPrompt, askAIForContact,
    goToOpeningPage, goToMainApp,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm(): Store {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used inside CrmProvider');
  return ctx;
}
