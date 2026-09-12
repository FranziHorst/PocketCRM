import React from "react";
import {
  CalendarCheck,
  LayoutDashboard,
  Users,
  MessageSquareCode,
  User,
} from "lucide-react";

export type NavTab = "today" | "dashboard" | "contacts" | "aichat" | "profile";

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  overdueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  overdueCount,
}) => {
  const tabs = [
    {
      id: "today" as NavTab,
      label: "Today",
      icon: CalendarCheck,
    },
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "contacts" as NavTab,
      label: "Contacts",
      icon: Users,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    {
      id: "aichat" as NavTab,
      label: "AI Copilot",
      icon: MessageSquareCode,
      isSpecial: true,
    },
    {
      id: "profile" as NavTab,
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200/80 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.3]" : "stroke-[1.8]"
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-rose-500 text-white font-bold text-[10px] rounded-full leading-none flex items-center justify-center min-w-[16px] h-4 ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 font-medium tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
