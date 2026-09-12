import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Clock,
  ExternalLink,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Github,
  Check,
  Tag,
  Star,
  Sparkles,
} from "lucide-react";
import { Contact } from "../types";
import { getReminderInfo } from "../utils/crmHelpers";

interface ContactsViewProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onOpenAddContact: () => void;
  onLogTouchpoint: (contactId: string) => void;
  onAskAIForContact: (contact: Contact) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onSelectContact,
  onOpenAddContact,
  onLogTouchpoint,
  onAskAIForContact,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [reminderFilter, setReminderFilter] = useState<"all" | "urgent">("all");

  // Collect all unique tags across contacts
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    contacts.forEach((c) => c.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [contacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const reminderInfo = getReminderInfo(contact);

      // Filter by reminder urgency
      if (
        reminderFilter === "urgent" &&
        reminderInfo.status !== "overdue" &&
        reminderInfo.status !== "today"
      ) {
        return false;
      }

      // Filter by tag
      if (selectedTag !== "all" && !contact.tags.includes(selectedTag)) {
        return false;
      }

      // Filter by search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.company.toLowerCase().includes(q) ||
        contact.role.toLowerCase().includes(q) ||
        contact.notes.toLowerCase().includes(q) ||
        contact.tags.some((t) => t.toLowerCase().includes(q)) ||
        contact.howWeMet.toLowerCase().includes(q)
      );
    });
  }, [contacts, searchQuery, selectedTag, reminderFilter]);

  // Count overdue/today
  const urgentCount = contacts.filter((c) => {
    const info = getReminderInfo(c);
    return info.status === "overdue" || info.status === "today";
  }).length;

  return (
    <div className="space-y-4 pb-8">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Network Contacts
          </h2>
          <p className="text-xs text-slate-500">
            {contacts.length} connections • {urgentCount} due for follow-up
          </p>
        </div>
        <button
          onClick={onOpenAddContact}
          className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Contact</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, role, tags, or notes..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs / Tags Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => {
            setReminderFilter("all");
            setSelectedTag("all");
          }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-medium transition-all ${
            reminderFilter === "all" && selectedTag === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All ({contacts.length})
        </button>

        <button
          onClick={() => {
            setReminderFilter(reminderFilter === "urgent" ? "all" : "urgent");
            setSelectedTag("all");
          }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 transition-all ${
            reminderFilter === "urgent"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Due Reminders ({urgentCount})</span>
        </button>

        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setSelectedTag(selectedTag === tag ? "all" : tag);
              setReminderFilter("all");
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1 ${
              selectedTag === tag
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Tag className="w-3 h-3 opacity-60" />
            <span>{tag}</span>
          </button>
        ))}
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            No contacts match your filters
          </p>
          <p className="text-xs text-slate-400">
            Try clearing search terms or create a new contact.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag("all");
              setReminderFilter("all");
            }}
            className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact) => {
            const reminder = getReminderInfo(contact);
            const { linkedin, twitter, instagram, website, github } =
              contact.socialLinks;

            return (
              <div
                key={contact.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all space-y-3"
              >
                {/* Top Row: Avatar, Name, Reminder Status */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => onSelectContact(contact)}
                    className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${
                        contact.avatarColor || "bg-indigo-600"
                      } text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {contact.name}
                        </h3>
                        {contact.isFavorite && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate font-medium">
                        {contact.role} • {contact.company}
                      </p>
                      {contact.location && (
                        <p className="text-[11px] text-slate-400 truncate">
                          📍 {contact.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reminder Badge */}
                  <div className="flex flex-col items-end flex-shrink-0 space-y-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${reminder.badgeClass}`}
                    >
                      {reminder.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Cadence: {contact.reminderCadence}
                    </span>
                  </div>
                </div>

                {/* Meeting Context / Notes Snippet */}
                {contact.notes && (
                  <p
                    onClick={() => onSelectContact(contact)}
                    className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 cursor-pointer line-clamp-2 leading-relaxed"
                  >
                    <span className="font-semibold text-slate-700">Notes:</span>{" "}
                    {contact.notes}
                  </p>
                )}

                {/* Social Media Accounts Connections */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    {linkedin && (
                      <a
                        href={linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {twitter && (
                      <a
                        href={twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                        title="X / Twitter"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Personal Website / Portfolio"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {github && (
                      <a
                        href={github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        title="GitHub"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* 1-Tap Actions: Log Touchpoint & Ask AI */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => onLogTouchpoint(contact.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 flex items-center space-x-1 transition-all"
                      title="Mark as contacted today (resets reminder timer)"
                    >
                      <Check className="w-3 h-3" />
                      <span>Log Touchpoint</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAskAIForContact(contact)}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors"
                      title="Consult AI Copilot regarding this contact"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* AI / Custom Tags */}
                {contact.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1 pt-1">
                    {contact.tags.map((t) => (
                      <span
                        key={t}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(t);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 font-medium cursor-pointer transition-colors"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
