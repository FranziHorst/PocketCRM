import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Sun,
  CloudSun,
  Moon,
  Sparkles,
  Check,
  Clock,
  ChevronRight,
} from "lucide-react";
import { UserProfile, Contact, DailyTask } from "../types";
import { getGreeting } from "../utils/crmHelpers";

interface OpeningPageViewProps {
  userProfile: UserProfile;
  contacts: Contact[];
  tasks: DailyTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (newTask: DailyTask) => void;
  onEnterMainApp: () => void;
  onSelectContact?: (contact: Contact) => void;
}

export const OpeningPageView: React.FC<OpeningPageViewProps> = ({
  userProfile,
  contacts,
  tasks,
  onToggleTask,
  onAddTask,
  onEnterMainApp,
  onSelectContact,
}) => {
  const firstName = userProfile.name.split(" ")[0] || "there";
  const greeting = getGreeting(firstName);

  // Today's date reference
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Filter tasks for this day (due today or overdue incomplete)
  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || (!t.completed && t.dueDate < todayStr)
  );

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const pendingCount = todayTasks.filter((t) => !t.completed).length;

  // Quick inline add task state
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<"high" | "medium" | "low">("high");

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask: DailyTask = {
      id: `task_${Date.now()}`,
      title: quickTitle.trim(),
      dueDate: todayStr,
      completed: false,
      priority: quickPriority,
      type: "follow-up",
    };

    onAddTask(newTask);
    setQuickTitle("");
  };

  const getGreetingIcon = () => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) {
      return <Sun className="w-5 h-5 text-amber-500" />;
    } else if (hour >= 12 && hour < 18) {
      return <CloudSun className="w-5 h-5 text-amber-500" />;
    }
    return <Moon className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-5 sm:p-7 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-300">
      {/* Top Bar: Minimal Logo & Direct Arrow to Main App */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight text-slate-900">
            Pocket CRM
          </span>
        </div>

        {/* Header Arrow Shortcut */}
        <button
          type="button"
          onClick={onEnterMainApp}
          className="group inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-semibold transition-all active:scale-95"
          title="Go to main app"
        >
          <span>Main App</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Center Content: Clean Greeting + Tasks for this Day */}
      <div className="my-auto py-5 space-y-5">
        {/* 1. Warm Greeting & Date */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            {getGreetingIcon()}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {greeting.text}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            {pendingCount > 0
              ? `You have ${pendingCount} task${
                  pendingCount > 1 ? "s" : ""
                } scheduled for today. Here is your daily focus:`
              : "You are all caught up on today's tasks! Ready to explore your network."}
          </p>
        </div>

        {/* 2. Tasks for This Day Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Tasks for Today
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {completedCount} of {todayTasks.length} done
            </span>
          </div>

          {/* Task List */}
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
            {todayTasks.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No tasks scheduled for today. Add one below!
              </div>
            ) : (
              todayTasks.map((task) => {
                const relatedContact = contacts.find((c) => c.id === task.contactId);

                return (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between p-2.5 rounded-xl border transition-all ${
                      task.completed
                        ? "bg-slate-50/70 border-slate-200/50 opacity-60"
                        : "bg-white border-slate-200/90 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                        title={task.completed ? "Mark incomplete" : "Mark done"}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 hover:stroke-indigo-600" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-semibold leading-tight ${
                            task.completed
                              ? "line-through text-slate-400"
                              : "text-slate-800"
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex items-center space-x-1.5 mt-1">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              task.priority === "high"
                                ? "bg-rose-50 text-rose-700"
                                : task.priority === "medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {task.priority}
                          </span>

                          {task.contactName && (
                            <span className="text-[10px] text-indigo-600 font-semibold truncate">
                              @{task.contactName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clean Inline Add Task Input */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Add another task for today..."
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Call to Action: Prominent Arrow to Main App Content */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onEnterMainApp}
          className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.99]"
        >
          <div className="text-left">
            <div className="text-xs font-medium text-indigo-200">
              Ready to explore your network?
            </div>
            <div className="text-sm font-bold text-white flex items-center space-x-1">
              <span>Go to Main App</span>
            </div>
          </div>

          {/* Prominent Right Arrow Icon Button */}
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-indigo-600 transition-colors shadow-2xs">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <p className="text-center text-[11px] text-slate-400 mt-2">
          Tap the arrow to open full CRM contacts, cadences, and AI copilot
        </p>
      </div>
    </div>
  );
};
