import { Contact, ReminderCadence } from "./types";

export function getGreeting(name: string): { text: string; subtext: string; icon: string } {
  const hour = new Date().getHours();
  let timeGreet = "Good morning";
  let icon = "☀️";
  let subtext = "Ready to cultivate your relationships today?";

  if (hour >= 12 && hour < 17) {
    timeGreet = "Good afternoon";
    icon = "🌤️";
    subtext = "Great time for a quick check-in or coffee follow-up.";
  } else if (hour >= 17) {
    timeGreet = "Good evening";
    icon = "🌙";
    subtext = "Reflect on today's connections and prepare for tomorrow.";
  }

  return {
    text: `${timeGreet}, ${name || "there"}!`,
    subtext,
    icon,
  };
}

export function getReminderInfo(contact: Contact): {
  status: "overdue" | "today" | "upcoming" | "none";
  label: string;
  daysDifference: number;
  badgeClass: string;
} {
  if (contact.reminderCadence === "none" || !contact.nextReminderDate) {
    return {
      status: "none",
      label: "No reminder",
      daysDifference: 0,
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminderDate = new Date(contact.nextReminderDate);
  reminderDate.setHours(0, 0, 0, 0);

  const diffTime = reminderDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      status: "overdue",
      label: `Overdue (${overdueDays}d)`,
      daysDifference: diffDays,
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200 font-medium",
    };
  } else if (diffDays === 0) {
    return {
      status: "today",
      label: "Due Today",
      daysDifference: 0,
      badgeClass: "bg-amber-50 text-amber-800 border-amber-300 font-medium",
    };
  } else if (diffDays <= 7) {
    return {
      status: "upcoming",
      label: `In ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      daysDifference: diffDays,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    };
  } else {
    return {
      status: "upcoming",
      label: `In ${diffDays} days`,
      daysDifference: diffDays,
      badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
    };
  }
}

export function calculateNextReminder(cadence: ReminderCadence, baseDate = new Date()): string {
  const d = new Date(baseDate);
  switch (cadence) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setDate(d.getDate() + 30);
      break;
    case "quarterly":
      d.setDate(d.getDate() + 90);
      break;
    default:
      d.setDate(d.getDate() + 14);
      break;
  }
  return d.toISOString().split("T")[0];
}

export type DuplicateMatch = { contact: Contact; reason: string };

const norm = (v?: string) => (v ?? "").trim().toLowerCase();
const digitsOnly = (v?: string) => (v ?? "").replace(/\D/g, "");
const profilePath = (url?: string) =>
  norm(url).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");

// Sortiert nach Aussagekraft: eine gleiche Mailadresse ist ein sicherer Treffer,
// ein gleicher Name nur ein Verdacht. Deshalb entscheidet der Nutzer, nicht wir.
export function findDuplicate(candidate: Contact, contacts: Contact[]): DuplicateMatch | undefined {
  const others = contacts.filter((ct) => ct.id !== candidate.id);

  const email = norm(candidate.email);
  if (email) {
    const hit = others.find((ct) => norm(ct.email) === email);
    if (hit) return { contact: hit, reason: "same email address" };
  }

  const phone = digitsOnly(candidate.phone);
  if (phone.length >= 6) {
    const hit = others.find((ct) => digitsOnly(ct.phone) === phone);
    if (hit) return { contact: hit, reason: "same phone number" };
  }

  const linkedin = profilePath(candidate.socialLinks?.linkedin);
  if (linkedin) {
    const hit = others.find((ct) => profilePath(ct.socialLinks?.linkedin) === linkedin);
    if (hit) return { contact: hit, reason: "same LinkedIn profile" };
  }

  const name = norm(candidate.name);
  if (name) {
    const hit = others.find((ct) => norm(ct.name) === name);
    if (hit) {
      const company = norm(candidate.company);
      return { contact: hit, reason: company && norm(hit.company) === company ? "same name and company" : "same name" };
    }
  }

  return undefined;
}

// Format date nicely
export function formatDate(dateString: string): string {
  if (!dateString) return "Never";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateString;
  }
}
