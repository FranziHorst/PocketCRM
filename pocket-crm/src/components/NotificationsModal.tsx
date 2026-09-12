import React from "react";
import { X, Bell, Check, Trash2, ArrowRight } from "lucide-react";
import { AppNotification } from "../types";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onSelectNotificationContact?: (contactId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onDismiss,
  onClearAll,
  onSelectNotificationContact,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Notifications & Reminders
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No notifications right now.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex items-center justify-between pt-1">
                  {n.contactId && onSelectNotificationContact ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectNotificationContact(n.contactId!);
                        onClose();
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center space-x-0.5"
                    >
                      <span>View Contact</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => onDismiss(n.id)}
                    className="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
