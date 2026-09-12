import React, { useState } from "react";
import {
  User,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Github,
  Edit3,
  Check,
  Plus,
  RotateCcw,
  Download,
  Share2,
  ExternalLink,
  Target,
  Sparkles,
} from "lucide-react";
import { UserProfile, Contact } from "../types";

interface ProfileViewProps {
  userProfile: UserProfile;
  contacts: Contact[];
  onUpdateProfile: (profile: UserProfile) => void;
  onOpenCreateAccount: () => void;
  onResetDemoData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  contacts,
  onUpdateProfile,
  onOpenCreateAccount,
  onResetDemoData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [newGoalInput, setNewGoalInput] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleAddGoal = () => {
    const trimmed = newGoalInput.trim();
    if (trimmed && !formData.networkingGoals.includes(trimmed)) {
      setFormData({
        ...formData,
        networkingGoals: [...formData.networkingGoals, trimmed],
      });
      setNewGoalInput("");
    }
  };

  const handleRemoveGoal = (goal: string) => {
    setFormData({
      ...formData,
      networkingGoals: formData.networkingGoals.filter((g) => g !== goal),
    });
  };

  const exportCRMData = () => {
    const data = {
      userProfile,
      contacts,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pocket-crm-${userProfile.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-8 text-xs">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-14 h-14 rounded-2xl ${
                userProfile.avatarColor || "bg-indigo-600"
              } text-white font-bold text-xl flex items-center justify-center shadow-sm shadow-indigo-200`}
            >
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  {userProfile.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                  Age {userProfile.age}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {userProfile.jobTitle} • {userProfile.company}
              </p>
              <p className="text-[11px] text-slate-400">
                📍 {userProfile.location} • {userProfile.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Bio */}
        {userProfile.bio && (
          <p className="mt-3.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {userProfile.bio}
          </p>
        )}

        {/* Connected Social Accounts Links */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 flex-wrap gap-y-2">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">
            Socials:
          </span>
          {userProfile.socialLinks.linkedin && (
            <a
              href={userProfile.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
            >
              <Linkedin className="w-3 h-3" />
              <span>LinkedIn</span>
            </a>
          )}
          {userProfile.socialLinks.twitter && (
            <a
              href={userProfile.socialLinks.twitter}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              <Twitter className="w-3 h-3" />
              <span>X</span>
            </a>
          )}
          {userProfile.socialLinks.instagram && (
            <a
              href={userProfile.socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-lg font-medium transition-colors"
            >
              <Instagram className="w-3 h-3" />
              <span>Instagram</span>
            </a>
          )}
          {userProfile.socialLinks.website && (
            <a
              href={userProfile.socialLinks.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition-colors"
            >
              <Globe className="w-3 h-3" />
              <span>Website</span>
            </a>
          )}
          {userProfile.socialLinks.github && (
            <a
              href={userProfile.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              <Github className="w-3 h-3" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>

      {/* Networking Goals Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Personal Networking Goals
            </h3>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-1.5">
          {userProfile.networkingGoals.map((goal) => (
            <span
              key={goal}
              className="px-2.5 py-1 bg-indigo-50/70 border border-indigo-200/60 text-indigo-800 rounded-lg font-medium text-[11px]"
            >
              🎯 {goal}
            </span>
          ))}
        </div>
      </div>

      {/* Edit Profile Form Modal / Inline */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl p-4 border-2 border-indigo-500 shadow-sm space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-slate-900">
              Edit My Profile Information
            </h3>
            <span className="text-[11px] text-slate-500">
              Update persona & social links
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Bio & Networking Intent
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Social Links Editing */}
          <div className="space-y-2 pt-2 border-t">
            <label className="block text-slate-800 font-bold">
              Social Media Connections
            </label>
            <div className="space-y-1.5">
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
                placeholder="LinkedIn profile URL"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
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
                placeholder="X / Twitter handle or URL"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
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
                placeholder="Instagram handle or URL"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Account Creation & Management */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          User Account Management
        </h3>
        <p className="text-slate-500 leading-relaxed">
          Manage your personal CRM identity, create a new profile from scratch,
          or export your network records.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenCreateAccount}
            className="flex items-center justify-center space-x-2 p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl border border-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User Profile</span>
          </button>

          <button
            type="button"
            onClick={exportCRMData}
            className="flex items-center justify-center space-x-2 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Network (JSON)</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Prototype Demo Persona (31yo Networker)
          </span>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset to default sample contacts and tasks?")) {
                onResetDemoData();
              }
            }}
            className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center space-x-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
