import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BottomNav, NavTab } from "./components/BottomNav";
import { OpeningPageView } from "./components/OpeningPageView";
import { DashboardView } from "./components/DashboardView";
import { ContactsView } from "./components/ContactsView";
import { AIChatView } from "./components/AIChatView";
import { ProfileView } from "./components/ProfileView";
import { ContactDetailModal } from "./components/ContactDetailModal";
import { AddTaskModal } from "./components/AddTaskModal";
import { AccountModal } from "./components/AccountModal";
import { NotificationsModal } from "./components/NotificationsModal";

import {
  initialUserProfile,
  initialContacts,
  initialDailyTasks,
  initialNotifications,
} from "./data/mockData";
import { UserProfile, Contact, DailyTask, AppNotification } from "./types";
import { calculateNextReminder, getReminderInfo } from "./utils/crmHelpers";

export default function App() {
  // Persistence with localStorage
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("pocket_crm_user_profile");
    return saved ? JSON.parse(saved) : initialUserProfile;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem("pocket_crm_contacts");
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem("pocket_crm_tasks");
    return saved ? JSON.parse(saved) : initialDailyTasks;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem("pocket_crm_notifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Active view state: starts on the clean, simple opening page with arrow to main app
  const [isOnOpeningPage, setIsOnOpeningPage] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  // Mobile frame wrapper toggle (phone mockup vs full width)
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Modals state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [chatPrefilledPrompt, setChatPrefilledPrompt] = useState<string>("");

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem("pocket_crm_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("pocket_crm_contacts", JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem("pocket_crm_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("pocket_crm_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Compute urgent contacts count for badge
  const overdueCount = contacts.filter((c) => {
    const info = getReminderInfo(c);
    return info.status === "overdue" || info.status === "today";
  }).length;

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Task handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTask: DailyTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Contact handlers
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleOpenAddContact = () => {
    const newEmptyContact: Contact = {
      id: `c_${Date.now()}`,
      name: "",
      role: "",
      company: "",
      howWeMet: "",
      notes: "",
      tags: ["New Contact"],
      socialLinks: {},
      reminderCadence: "biweekly",
      lastContacted: new Date().toISOString().split("T")[0],
      nextReminderDate: calculateNextReminder("biweekly"),
      avatarColor: "bg-indigo-600",
    };
    setSelectedContact(newEmptyContact);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (updatedContact: Contact) => {
    setContacts((prev) => {
      const exists = prev.some((c) => c.id === updatedContact.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedContact.id ? updatedContact : c));
      }
      return [updatedContact, ...prev];
    });
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
      setIsContactModalOpen(false);
    }
  };

  // 1-Tap Log Touchpoint: updates lastContacted to today and pushes nextReminderDate forward
  const handleLogTouchpoint = (contactId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          const nextDate = calculateNextReminder(c.reminderCadence);
          return {
            ...c,
            lastContacted: todayStr,
            nextReminderDate: nextDate,
          };
        }
        return c;
      })
    );

    // Also mark any associated tasks for this contact as complete
    setTasks((prev) =>
      prev.map((t) =>
        t.contactId === contactId && t.type === "follow-up"
          ? { ...t, completed: true }
          : t
      )
    );
  };

  // Notification handlers
  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // AI Prompt jump helper
  const handleAskAIWithPrompt = (promptText: string) => {
    setChatPrefilledPrompt(promptText);
    setActiveTab("aichat");
  };

  const handleAskAIForContact = (contact: Contact) => {
    const prompt = `Give me 3 strategic follow-up talking points or a warm message draft for ${contact.name} (${contact.role} at ${contact.company}). Meeting context: "${contact.howWeMet}". Notes: "${contact.notes}".`;
    handleAskAIWithPrompt(prompt);
  };

  // Reset to default 31yo networker persona sample data
  const handleResetDemoData = () => {
    setUserProfile(initialUserProfile);
    setContacts(initialContacts);
    setTasks(initialDailyTasks);
    setNotifications(initialNotifications);
  };

  return (
    <div
      id="pocket-crm-root"
      className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-indigo-500 selection:text-white"
    >
      {/* Container: Realistic Mobile Frame or Full Screen */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? "max-w-[420px] h-[100dvh] sm:h-[844px] sm:rounded-[40px] sm:ring-[12px] sm:ring-slate-800/90 shadow-2xl border-0 sm:border-4 sm:border-slate-700/60 flex flex-col overflow-hidden"
            : "max-w-4xl min-h-screen sm:min-h-[90vh] sm:rounded-3xl shadow-xl flex flex-col overflow-hidden"
        } bg-slate-50 relative`}
      >
        {/* Mobile Status Bar simulation (only in mobile frame on desktop) */}
        {isMobileFrame && (
          <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 bg-white text-slate-800 text-[11px] font-semibold select-none">
            <span>9:41</span>
            {/* Dynamic Island / speaker notch pill */}
            <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/80" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span>5G</span>
              <span className="w-5 h-2.5 rounded-sm border border-slate-700 p-0.5 flex items-center">
                <span className="w-full h-full bg-slate-800 rounded-2xs" />
              </span>
            </div>
          </div>
        )}

        {isOnOpeningPage ? (
          /* Simple, Clean Opening Page at the start with Arrow to main app content */
          <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
            <OpeningPageView
              userProfile={userProfile}
              contacts={contacts}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onEnterMainApp={() => {
                setIsOnOpeningPage(false);
                setActiveTab("dashboard");
              }}
              onSelectContact={handleSelectContact}
            />
          </div>
        ) : (
          /* Main App Content */
          <>
            {/* Global App Header */}
            <Header
              userProfile={userProfile}
              activeTab={activeTab}
              isMobileFrame={isMobileFrame}
              setIsMobileFrame={setIsMobileFrame}
              unreadCount={unreadNotificationsCount}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenProfile={() => setActiveTab("profile")}
              onOpenStartPage={() => setIsOnOpeningPage(true)}
            />

            {/* Main Content Scroll Area */}
            <main className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
              {activeTab === "today" && (
                <OpeningPageView
                  userProfile={userProfile}
                  contacts={contacts}
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onEnterMainApp={() => setActiveTab("dashboard")}
                  onSelectContact={handleSelectContact}
                />
              )}

              {activeTab === "dashboard" && (
                <DashboardView
                  userProfile={userProfile}
                  contacts={contacts}
                  tasks={tasks}
                  notifications={notifications}
                  onToggleTask={handleToggleTask}
                  onOpenAddTask={() => setIsAddTaskOpen(true)}
                  onOpenAddContact={handleOpenAddContact}
                  onSelectContact={handleSelectContact}
                  onNavigateToTab={(tab) => {
                    if (tab === "today") {
                      setIsOnOpeningPage(true);
                    } else {
                      setActiveTab(tab);
                    }
                  }}
                  onLogTouchpoint={handleLogTouchpoint}
                  onDismissNotification={handleDismissNotification}
                  onAskAIWithPrompt={handleAskAIWithPrompt}
                />
              )}

              {activeTab === "contacts" && (
                <ContactsView
                  contacts={contacts}
                  onSelectContact={handleSelectContact}
                  onOpenAddContact={handleOpenAddContact}
                  onLogTouchpoint={handleLogTouchpoint}
                  onAskAIForContact={handleAskAIForContact}
                />
              )}

              {activeTab === "aichat" && (
                <AIChatView
                  userProfile={userProfile}
                  contacts={contacts}
                  tasks={tasks}
                  prefilledPrompt={chatPrefilledPrompt}
                  onClearPrefilledPrompt={() => setChatPrefilledPrompt("")}
                />
              )}

              {activeTab === "profile" && (
                <ProfileView
                  userProfile={userProfile}
                  contacts={contacts}
                  onUpdateProfile={setUserProfile}
                  onOpenCreateAccount={() => setIsCreateAccountOpen(true)}
                  onResetDemoData={handleResetDemoData}
                />
              )}
            </main>

            {/* Bottom Navigation Bar */}
            <BottomNav
              activeTab={activeTab}
              setActiveTab={(tab) => {
                if (tab === "today") {
                  setIsOnOpeningPage(true);
                } else {
                  setActiveTab(tab);
                }
              }}
              overdueCount={overdueCount}
            />
          </>
        )}

        {/* Mobile Home indicator bar on phone frame */}
        {isMobileFrame && (
          <div className="hidden sm:flex justify-center pb-1.5 bg-white">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
      </div>

      {/* Modals */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setSelectedContact(null);
        }}
        onSaveContact={handleSaveContact}
        onDeleteContact={handleDeleteContact}
        onLogTouchpoint={handleLogTouchpoint}
        onAskAIForContact={handleAskAIForContact}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        contacts={contacts}
        onAddTask={handleAddTask}
      />

      <AccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onCreateAccount={(newProfile) => {
          setUserProfile(newProfile);
          setActiveTab("profile");
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onClearAll={handleClearAllNotifications}
        onSelectNotificationContact={(cId) => {
          const c = contacts.find((item) => item.id === cId);
          if (c) {
            handleSelectContact(c);
          }
        }}
      />
    </div>
  );
}
