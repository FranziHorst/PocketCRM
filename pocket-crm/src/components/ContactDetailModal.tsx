import React, { useState } from "react";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Github,
  Plus,
  Trash2,
  Check,
  Loader2,
  Tag as TagIcon,
  MessageSquare,
} from "lucide-react";
import { Contact, ReminderCadence, TagSuggestion } from "../types";
import { calculateNextReminder, getReminderInfo } from "../utils/crmHelpers";

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onLogTouchpoint: (contactId: string) => void;
  onAskAIForContact: (contact: Contact) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onSaveContact,
  onDeleteContact,
  onLogTouchpoint,
  onAskAIForContact,
}) => {
  if (!isOpen || !contact) return null;

  const [formData, setFormData] = useState<Contact>({ ...contact });
  const [newTagInput, setNewTagInput] = useState("");
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<TagSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const reminderInfo = getReminderInfo(formData);

  // Handle AI Tag Suggestion via server route
  const handleSuggestTags = async () => {
    setIsSuggestingTags(true);
    setAiError(null);
    setAiSuggestions([]);
    setSelectedSuggestions([]);

    try {
      const response = await fetch("/api/gemini/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          company: formData.company,
          meetingNotes: `${formData.howWeMet}. ${formData.notes}`,
          relationship: formData.reminderCadence,
          socialProfiles: formData.socialLinks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to suggest tags");
      }

      const data = await response.json();
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        setAiSuggestions(data.tags);
        // Pre-select tags not already present
        const unadded = data.tags
          .filter((t: TagSuggestion) => !formData.tags.includes(t.tag))
          .map((t: TagSuggestion) => t.tag);
        setSelectedSuggestions(unadded);
      } else {
        setAiError("No tags generated. Try adding more notes about this contact.");
      }
    } catch (err: any) {
      console.error("AI Tag suggestion failed:", err);
      setAiError(err.message || "Failed to generate suggestions. Please check server.");
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleApplySelectedTags = () => {
    const combined = Array.from(
      new Set([...formData.tags, ...selectedSuggestions])
    );
    setFormData({ ...formData, tags: combined });
    setAiSuggestions([]);
    setSelectedSuggestions([]);
  };

  const handleAddManualTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmed],
      });
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleCadenceChange = (cadence: ReminderCadence) => {
    const nextDate = calculateNextReminder(cadence);
    setFormData({
      ...formData,
      reminderCadence: cadence,
      nextReminderDate: nextDate,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContact(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-full ${
                formData.avatarColor || "bg-indigo-600"
              } text-white font-bold text-sm flex items-center justify-center`}
            >
              {formData.name ? formData.name.charAt(0) : "?"}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {formData.name || "New Contact"}
              </h2>
              <p className="text-xs text-slate-500">Contact Details & Reminders</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onAskAIForContact(formData)}
              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Ask AI Copilot about this contact"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-5 space-y-5 flex-1 text-xs"
        >
          {/* Quick Reminder Status Banner */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-semibold text-slate-800">
                  Reminder Cadence:
                </span>
                <span className={`ml-2 px-2 py-0.5 rounded-full border text-[10px] ${reminderInfo.badgeClass}`}>
                  {reminderInfo.label}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onLogTouchpoint(formData.id);
                setFormData({
                  ...formData,
                  lastContacted: new Date().toISOString().split("T")[0],
                  nextReminderDate: calculateNextReminder(formData.reminderCadence),
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs flex items-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>Contacted Today</span>
            </button>
          </div>

          {/* Primary Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g., Maya Lin"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Job Title / Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g., VP of Product"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g., Loomis AI"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="maya@example.com"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="+1 (415) ..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>

          {/* Reminder Cadence Settings */}
          <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Reminder Schedule & Follow-up Cadence</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-600 mb-1">Frequency</label>
                <select
                  value={formData.reminderCadence}
                  onChange={(e) =>
                    handleCadenceChange(e.target.value as ReminderCadence)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="weekly">Weekly (Every 7 days)</option>
                  <option value="biweekly">Bi-weekly (Every 14 days)</option>
                  <option value="monthly">Monthly (Every 30 days)</option>
                  <option value="quarterly">Quarterly (Every 90 days)</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={formData.nextReminderDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nextReminderDate: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Social Media Accounts */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-900 text-xs">
              Connected Social Media Profiles
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Linkedin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <input
                  type="text"
                  value={formData.socialLinks.linkedin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        linkedin: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Twitter className="w-4 h-4 text-slate-800 flex-shrink-0" />
                <input
                  type="text"
                  value={formData.socialLinks.twitter || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        twitter: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  placeholder="https://x.com/... or @handle"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Instagram className="w-4 h-4 text-pink-600 flex-shrink-0" />
                <input
                  type="text"
                  value={formData.socialLinks.instagram || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        instagram: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <input
                  type="text"
                  value={formData.socialLinks.website || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        website: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  placeholder="Personal website or blog URL"
                />
              </div>
            </div>
          </div>

          {/* Meeting Background & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                How We Met / Mutual Connection
              </label>
              <input
                type="text"
                value={formData.howWeMet}
                onChange={(e) =>
                  setFormData({ ...formData, howWeMet: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                placeholder="e.g., SaaStr 2026 conference panel on agentic UX"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Conversation Notes, Interests & Follow-up Context
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl leading-relaxed"
                placeholder="Key discussion topics, what they care about, personal details (kids, hobbies, coffee preference), collaboration ideas..."
              />
            </div>
          </div>

          {/* AI Tagging & Organization */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <TagIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-bold text-slate-900">
                  Tags & Organization
                </span>
              </div>
              <button
                type="button"
                onClick={handleSuggestTags}
                disabled={isSuggestingTags}
                className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg font-semibold text-[11px] shadow-xs flex items-center space-x-1.5 disabled:opacity-50 transition-all"
              >
                {isSuggestingTags ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>AI Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Suggest AI Tags</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Suggested Tags Panel */}
            {aiError && (
              <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg">
                {aiError}
              </p>
            )}

            {aiSuggestions.length > 0 && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 space-y-2">
                <p className="text-[11px] font-bold text-indigo-950 flex items-center justify-between">
                  <span>Gemini Suggested Tags:</span>
                  <button
                    type="button"
                    onClick={handleApplySelectedTags}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Add Selected ({selectedSuggestions.length})</span>
                  </button>
                </p>
                <div className="space-y-1.5">
                  {aiSuggestions.map((item) => {
                    const isSelected = selectedSuggestions.includes(item.tag);
                    return (
                      <div
                        key={item.tag}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSuggestions(
                              selectedSuggestions.filter((t) => t !== item.tag)
                            );
                          } else {
                            setSelectedSuggestions([...selectedSuggestions, item.tag]);
                          }
                        }}
                        className={`p-1.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-700"
                            : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs">
                            #{item.tag}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-indigo-100" : "text-slate-400"
                            }`}
                          >
                            • {item.reason}
                          </span>
                        </div>
                        <span className="text-xs font-bold">
                          {isSelected ? "✓" : "+"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Tags Chips */}
            <div className="flex items-center flex-wrap gap-1.5">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-medium text-[11px] flex items-center space-x-1 shadow-2xs"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-rose-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Manual Tag Input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManualTag();
                  }
                }}
                placeholder="Add custom tag (e.g., Angel Investor, Seed Deal)..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddManualTag}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Remove ${formData.name} from your contacts?`)) {
                  onDeleteContact(formData.id);
                  onClose();
                }
              }}
              className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs shadow-indigo-200 transition-all"
              >
                Save Contact
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
