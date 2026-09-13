import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { UserProfile, Contact, DailyTask, AppNotification, CrmEvent } from '../types';
import { initialUserProfile, initialContacts, initialDailyTasks, initialNotifications, initialEvents } from '../mockData';
import { calculateNextReminder } from '../crmHelpers';

const KEYS = {
  profile: 'pocket_crm_user_profile',
  contacts: 'pocket_crm_contacts',
  tasks: 'pocket_crm_tasks',
  notifications: 'pocket_crm_notifications',
  events: 'pocket_crm_events',
  settings: 'pocket_crm_settings',
} as const;

export type ContactsGrouping = 'recent' | 'events' | 'az';
type Settings = { calendarSync: boolean; contactsGrouping: ContactsGrouping };
const defaultSettings: Settings = { calendarSync: false, contactsGrouping: 'recent' };

function todayStr() { return new Date().toISOString().split('T')[0]; }

// Contacts saved before events existed get their demo event links back.
function withEventLinks(stored: Contact[]): Contact[] {
  return stored.map((ct) => {
    const init = initialContacts.find((i) => i.id === ct.id);
    return init ? { ...ct, eventId: ct.eventId ?? init.eventId, metOn: ct.metOn ?? init.metOn } : ct;
  });
}

type Store = {
  ready: boolean;
  userProfile: UserProfile;
  contacts: Contact[];
  tasks: DailyTask[];
  notifications: AppNotification[];
  events: CrmEvent[];
  currentEvent?: CrmEvent;
  calendarSync: boolean;
  setCalendarSync: (on: boolean) => void;
  contactsGrouping: ContactsGrouping;
  setContactsGrouping: (g: ContactsGrouping) => void;
  pendingCount: number;
  unreadCount: number;

  toggleTask: (taskId: string) => void;
  addTask: (task: DailyTask) => void;
  saveContact: (contact: Contact) => void;
  deleteContact: (contactId: string) => void;
  dismissNotification: (id: string) => void;
  updateProfile: (profile: UserProfile) => void;

  newContact: Contact | null;
  openAddContact: (prefill?: Partial<Contact>) => void;
  closeAddContact: () => void;
  isScanOpen: boolean;
  setScanOpen: (open: boolean) => void;
  isSpeakOpen: boolean;
  setSpeakOpen: (open: boolean) => void;
  isAddTaskOpen: boolean;
  setAddTaskOpen: (open: boolean) => void;

  chatPrefilledPrompt: string;
  clearPrefilledPrompt: () => void;
  iceBreakerContactId: string | null;
  askIceBreakerFor: (contact: Contact) => void;
  clearIceBreakerRequest: () => void;
  askAIWithPrompt: (prompt: string) => void;
  askAIForContact: (contact: Contact) => void;
};

const CrmContext = createContext<Store | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [tasks, setTasks] = useState<DailyTask[]>(initialDailyTasks);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [events, setEvents] = useState<CrmEvent[]>(initialEvents);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const [newContact, setNewContact] = useState<Contact | null>(null);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [isScanOpen, setScanOpen] = useState(false);
  const [isSpeakOpen, setSpeakOpen] = useState(false);
  const [chatPrefilledPrompt, setChatPrefilledPrompt] = useState('');
  const [iceBreakerContactId, setIceBreakerContactId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, ct, t, n, ev, st] = await Promise.all([
          AsyncStorage.getItem(KEYS.profile),
          AsyncStorage.getItem(KEYS.contacts),
          AsyncStorage.getItem(KEYS.tasks),
          AsyncStorage.getItem(KEYS.notifications),
          AsyncStorage.getItem(KEYS.events),
          AsyncStorage.getItem(KEYS.settings),
        ]);
        if (p) setUserProfile(JSON.parse(p));
        if (ct) setContacts(withEventLinks(JSON.parse(ct)));
        if (t) setTasks(JSON.parse(t));
        if (n) setNotifications(JSON.parse(n));
        if (ev) setEvents(JSON.parse(ev));
        if (st) setSettings({ ...defaultSettings, ...JSON.parse(st) });
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
    AsyncStorage.setItem(KEYS.events, JSON.stringify(events));
    AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  }, [ready, userProfile, contacts, tasks, notifications, events, settings]);

  const currentEvent = useMemo(() => {
    const d = todayStr();
    return events.find((e) => e.startDate <= d && (e.endDate ?? e.startDate) >= d);
  }, [events]);

  const pendingCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
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
  };

  const dismissNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const updateProfile = (profile: UserProfile) => setUserProfile(profile);

  const closeAddContact = () => setNewContact(null);
  const openAddContact = (prefill: Partial<Contact> = {}) =>
    setNewContact({
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
      eventId: currentEvent?.id,
      metOn: todayStr(),
      ...prefill,
    });

  const askAIWithPrompt = (prompt: string) => {
    setChatPrefilledPrompt(prompt);
    setNewContact(null);
    router.replace('/(tabs)/aichat');
  };
  const askAIForContact = (contact: Contact) =>
    askAIWithPrompt(
      `Give me 3 strategic follow-up talking points or a warm message draft for ${contact.name} (${contact.role} at ${contact.company}). Meeting context: "${contact.howWeMet}". Notes: "${contact.notes}".`
    );
  const clearPrefilledPrompt = () => setChatPrefilledPrompt('');
  const askIceBreakerFor = (contact: Contact) => {
    setIceBreakerContactId(contact.id);
    setNewContact(null);
    router.replace('/(tabs)/aichat');
  };
  const clearIceBreakerRequest = () => setIceBreakerContactId(null);

  const value: Store = {
    ready, userProfile, contacts, tasks, notifications, events, currentEvent, pendingCount, unreadCount,
    calendarSync: settings.calendarSync,
    setCalendarSync: (on) => setSettings((x) => ({ ...x, calendarSync: on })),
    contactsGrouping: settings.contactsGrouping,
    setContactsGrouping: (g) => setSettings((x) => ({ ...x, contactsGrouping: g })),
    toggleTask, addTask, saveContact, deleteContact,
    dismissNotification, updateProfile,
    newContact, openAddContact, closeAddContact,
    isAddTaskOpen, setAddTaskOpen, isScanOpen, setScanOpen, isSpeakOpen, setSpeakOpen,
    chatPrefilledPrompt, clearPrefilledPrompt, askAIWithPrompt, askAIForContact,
    iceBreakerContactId, askIceBreakerFor, clearIceBreakerRequest,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm(): Store {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used inside CrmProvider');
  return ctx;
}
