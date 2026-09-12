export interface SocialMediaLinks {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  github?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  jobTitle: string;
  company: string;
  location: string;
  bio: string;
  networkingGoals: string[];
  socialLinks: SocialMediaLinks;
  avatarColor?: string;
  joinedDate?: string;
}

export type ReminderCadence = "weekly" | "biweekly" | "monthly" | "quarterly" | "custom" | "none";

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  phone?: string;
  location?: string;
  howWeMet: string;
  notes: string;
  tags: string[];
  socialLinks: SocialMediaLinks;
  reminderCadence: ReminderCadence;
  lastContacted: string; // ISO date string
  nextReminderDate: string; // ISO date string
  isFavorite?: boolean;
  avatarColor?: string;
  eventId?: string; // event where we met (see CrmEvent)
  metOn?: string; // ISO date we first met
}

export interface CrmEvent {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  location?: string;
  source: "calendar" | "manual";
  networkAttendees?: number; // demo value until calendar sync between users exists
}

export interface DailyTask {
  id: string;
  title: string;
  contactId?: string;
  contactName?: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  priority: "high" | "medium" | "low";
  type: "follow-up" | "coffee" | "intro" | "prep" | "other";
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "reminder" | "ai-insight" | "social" | "system";
  contactId?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface TagSuggestion {
  tag: string;
  reason: string;
}
