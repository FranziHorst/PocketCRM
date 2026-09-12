import React from "react";
import { Sparkles, Smartphone, Monitor, Bell, CalendarCheck } from "lucide-react";
import { UserProfile } from "../types";

interface HeaderProps {
  userProfile: UserProfile;
  activeTab: string;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenStartPage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  isMobileFrame,
  setIsMobileFrame,
  unreadCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenStartPage,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2.5">
        {onOpenStartPage ? (
          <button
            type="button"
            onClick={onOpenStartPage}
            className="flex items-center space-x-2 text-left hover:opacity-85 transition-opacity"
            title="Return to Opening Page"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                Pocket CRM
              </h1>
              <p className="text-[10px] text-indigo-600 font-semibold flex items-center space-x-0.5">
                <span>← Start Page</span>
              </p>
            </div>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                Pocket CRM
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Personal Network
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {onOpenStartPage && (
          <button
            type="button"
            onClick={onOpenStartPage}
            className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-full transition-colors"
            title="View today's opening page & tasks"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Opening Page</span>
          </button>
        )}

        {/* Toggle between realistic phone frame view and full fluid view */}
        <button
          type="button"
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          title={isMobileFrame ? "Switch to Full Screen" : "Switch to Mobile Frame"}
          className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              <span>Mobile Frame</span>
            </>
          )}
        </button>

        {/* Notifications trigger */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* Profile Avatar Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center space-x-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors"
          title="My Profile & Account"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            {userProfile.name.charAt(0)}
          </div>
          <span className="text-xs font-medium text-slate-700 hidden sm:inline">
            {userProfile.name.split(" ")[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
