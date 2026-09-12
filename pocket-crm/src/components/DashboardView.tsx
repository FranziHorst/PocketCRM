import React from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  UserPlus,
  Check,
} from "lucide-react";
import { UserProfile, Contact, DailyTask, AppNotification } from "../types";
import { getGreeting, getReminderInfo } from "../utils/crmHelpers";

interface DashboardViewProps {
  userProfile: UserProfile;
  contacts: Contact[];
  tasks: DailyTask[];
  notifications: AppNotification[];
  onToggleTask: (taskId: string) => void;
  onOpenAddTask: () => void;
  onOpenAddContact: () => void;
  onSelectContact: (contact: Contact) => void;
  onNavigateToTab: (tab: "today" | "dashboard" | "contacts" | "aichat" | "profile") => void;
  onLogTouchpoint: (contactId: string) => void;
  onDismissNotification: (notificationId: string) => void;
  onAskAIWithPrompt: (promptText: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  contacts,
  tasks,
  notifications,
  onToggleTask,
  onOpenAddTask,
  onOpenAddContact,
  onSelectContact,
  onNavigateToTab,
  onLogTouchpoint,
  onDismissNotification,
  onAskAIWithPrompt,
}) => {
  const greeting = getGreeting(userProfile.name.split(" ")[0]);

  // Compute urgent contacts (overdue or due today)
  const urgentContacts = contacts.filter((c) => {
    const info = getReminderInfo(c);
    return info.status === "overdue" || info.status === "today";
  });

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-5 pb-8">
      {/* Friendly Greeting Card */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>{greeting.icon}</span>
            <span>Personal CRM • {userProfile.age} yo Networker</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {greeting.text}
          </h2>
          <p className="text-xs text-indigo-100/90 mt-1 max-w-sm leading-relaxed">
            {greeting.subtext}
          </p>

          {/* Quick Network Momentum Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-indigo-700/50">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[11px] text-indigo-200 block font-medium">
                Pending Tasks
              </span>
              <span className="text-lg font-bold text-white">
                {pendingTasks.length}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[11px] text-indigo-200 block font-medium">
                Due Contacts
              </span>
              <span className="text-lg font-bold text-amber-300">
                {urgentContacts.length}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[11px] text-indigo-200 block font-medium">
                Total Network
              </span>
              <span className="text-lg font-bold text-emerald-300">
                {contacts.length}
              </span>
            </div>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-8 top-0 w-24 h-24 bg-violet-500/20 rounded-full blur-xl pointer-events-none" />
      </section>

      {/* Quick Actions Carousel */}
      <section className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onNavigateToTab("today")}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95"
        >
          <CalendarCheck className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Today's Briefing</span>
        </button>
        <button
          onClick={onOpenAddTask}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200/70 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
        <button
          onClick={onOpenAddContact}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Contact</span>
        </button>
        <button
          onClick={() => onNavigateToTab("aichat")}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-semibold border border-violet-200 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[2.5] text-violet-600" />
          <span>Ask AI Copilot</span>
        </button>
        <button
          onClick={() => onNavigateToTab("contacts")}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all active:scale-95"
        >
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Reminders</span>
        </button>
      </section>

      {/* Urgent Contact Touchpoints Alert */}
      {urgentContacts.length > 0 && (
        <section className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Contact Reminders Due ({urgentContacts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab("contacts")}
              className="text-[11px] font-semibold text-amber-900 hover:underline flex items-center space-x-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2">
            {urgentContacts.slice(0, 2).map((contact) => {
              const reminder = getReminderInfo(contact);
              return (
                <div
                  key={contact.id}
                  className="bg-white rounded-xl p-3 border border-amber-200/60 shadow-xs flex items-center justify-between gap-2"
                >
                  <div
                    onClick={() => onSelectContact(contact)}
                    className="flex items-center space-x-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${
                        contact.avatarColor || "bg-indigo-600"
                      } text-white font-semibold text-xs flex items-center justify-center flex-shrink-0`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {contact.name}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border ${reminder.badgeClass}`}
                        >
                          {reminder.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {contact.role} at {contact.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onLogTouchpoint(contact.id)}
                      className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center space-x-1"
                      title="Mark as contacted today"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Log</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onAskAIWithPrompt(
                          `Draft a friendly follow-up message to ${contact.name} (${contact.role} at ${contact.company}) referencing our previous discussion: "${contact.notes}". Keep it natural and ready to send via LinkedIn or WhatsApp.`
                        )
                      }
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                      title="Ask AI to draft message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Up-to-date Daily Tasks Section */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Today's Tasks ({pendingTasks.length} pending)
            </h3>
          </div>
          <button
            onClick={onOpenAddTask}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No daily tasks yet. Tap "+ Add" to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-start space-x-3 p-2.5 rounded-xl border transition-all ${
                  task.completed
                    ? "bg-slate-50/80 border-slate-200/50 opacity-60"
                    : "bg-white border-slate-200 hover:border-indigo-200 shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 hover:stroke-indigo-600" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-medium leading-tight ${
                      task.completed
                        ? "line-through text-slate-400"
                        : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center flex-wrap gap-1.5 mt-1">
                    {task.contactName && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                        @{task.contactName}
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                        task.priority === "high"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : task.priority === "medium"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Up-to-date Notifications Feed */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Notifications & Insights
            </h3>
          </div>
          {unreadNotifications.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              {unreadNotifications.length} new
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            You're all caught up on notifications!
          </p>
        ) : (
          <div className="space-y-2.5">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {notif.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDismissNotification(notif.id)}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded-md hover:bg-slate-200/60"
                  title="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
