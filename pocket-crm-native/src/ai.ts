import { Contact, CrmEvent, DailyTask, TagSuggestion, UserProfile } from '../types';
import { getReminderInfo } from '../crmHelpers';

// ---------------------------------------------------------------------------
// TODO(KI): Platzhalter. Hier später echte KI anschließen.
// Die Web-App hat dafür einen kleinen Server (pocket-crm/server.ts) mit den
// Endpunkten /api/gemini/chat und /api/gemini/suggest-tags genutzt.
// Die Funktionssignaturen hier können dabei gleich bleiben.
// ---------------------------------------------------------------------------

type Ctx = { userProfile: UserProfile; contacts: Contact[]; tasks: DailyTask[] };

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function askAssistant(message: string, ctx: Ctx): Promise<string> {
  await wait(700);
  const q = message.toLowerCase();

  const mentioned = ctx.contacts.find((ct) => q.includes(ct.name.toLowerCase()));
  if (mentioned) {
    return `Here's a draft for ${mentioned.name}:\n\nHi ${mentioned.name.split(' ')[0]}, it was great connecting${
      mentioned.howWeMet ? ` at ${mentioned.howWeMet}` : ''
    }. I've been thinking about what you mentioned regarding "${mentioned.notes.slice(0, 80)}"... Would you be up for a quick coffee or call next week?\n\nBest,\n${ctx.userProfile.name.split(' ')[0]}\n\n(Demo reply – real AI not connected yet.)`;
  }

  if (q.includes('overdue') || q.includes('check-in') || q.includes('due')) {
    const due = ctx.contacts.filter((ct) => {
      const s = getReminderInfo(ct).status;
      return s === 'overdue' || s === 'today';
    });
    if (due.length === 0) return 'Nobody is overdue right now – nice work staying on top of your network!';
    return `These contacts are due for a check-in:\n\n${due
      .map((ct) => `• ${ct.name} – ${getReminderInfo(ct).label} (${ct.role} at ${ct.company})`)
      .join('\n')}\n\n(Demo reply – real AI not connected yet.)`;
  }

  if (q.includes('question') || q.includes('investor')) {
    return `Three smart questions for an angel investor:\n\n1. What patterns do you see in founders who scale past seed?\n2. How do you like to be kept in the loop between rounds?\n3. Which intro in your network would be most valuable for us right now?\n\n(Demo reply – real AI not connected yet.)`;
  }

  if (q.includes('icebreaker') || q.includes('mixer')) {
    return `Icebreakers for a founder mixer:\n\n• "What's the most surprising thing you learned from a customer this month?"\n• "Which tool did you adopt recently that you can't live without?"\n• "What would you build if funding wasn't a constraint?"\n\n(Demo reply – real AI not connected yet.)`;
  }

  return `Thanks, ${ctx.userProfile.name.split(' ')[0]}! I know your ${ctx.contacts.length} contacts and ${
    ctx.tasks.filter((t) => !t.completed).length
  } open tasks. Ask me to draft a follow-up, list who's overdue, or prep questions for a meeting.\n\n(Demo reply – real AI not connected yet.)`;
}

export async function suggestTags(contact: Contact): Promise<TagSuggestion[]> {
  await wait(600);
  const text = `${contact.role} ${contact.company} ${contact.howWeMet} ${contact.notes}`.toLowerCase();
  const out: TagSuggestion[] = [];
  const add = (tag: string, reason: string) => {
    if (!out.some((t) => t.tag === tag)) out.push({ tag, reason });
  };
  if (/invest|fund|capital|vc|angel/.test(text)) add('Investor', 'Role or notes mention investing');
  if (/founder|ceo|co-founder|startup/.test(text)) add('Founder', 'Leads a company');
  if (/product|design|ux/.test(text)) add('Product', 'Works in product or design');
  if (/engineer|developer|cto|tech/.test(text)) add('Engineering', 'Technical background');
  if (/conference|meetup|panel|summit|event/.test(text)) add('Met at Event', 'You met at an event');
  if (/coffee|lunch|dinner/.test(text)) add('Coffee Chat', 'Notes mention meeting up');
  if (out.length === 0) add('Follow-up', 'Keep the conversation going');
  return out;
}

// TODO(KI): Später echte Zusammenfassung; bis dahin der erste Satz der Notizen, gekürzt.
export function summarizeNotes(notes: string, max = 110): string {
  const text = notes.trim().replace(/\s+/g, ' ');
  if (!text) return '';
  const first = text.split(/(?<=[.!?])\s/)[0];
  const out = first.length > max ? `${first.slice(0, max - 1).trimEnd()}…` : first;
  return out;
}

// TODO(KI): Platzhalter. Baut Ice Breaker aus Notizen, Erstkontakt-Event, Firma und Tags nach festen Mustern.
// Später ersetzt die echte KI nur diese Funktion; Signatur kann bleiben.
export function iceBreakersFor(contact: Contact, events: CrmEvent[], seed = 0): string[] {
  const first = contact.name.split(' ')[0];
  const event = contact.eventId ? events.find((e) => e.id === contact.eventId) : undefined;
  const noteSentences = contact.notes.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  const topic = noteSentences[0]?.replace(/\.$/, '');
  const pool: string[] = [];

  if (topic) pool.push(`"Last time we talked, you said: '${topic}.' How has that been going since?"`);
  if (event) pool.push(`"We met at ${event.name} – what was your biggest takeaway from it?"`);
  if (contact.company) pool.push(`"What's the most exciting thing happening at ${contact.company} right now?"`);
  if (contact.role) pool.push(`"As ${withArticle(contact.role)}, what's the problem you keep coming back to these days?"`);
  if (contact.tags.length) pool.push(`"I remember you're into ${contact.tags.slice(0, 2).join(' and ')} – anything new you're excited about there?"`);
  if (noteSentences[1]) pool.push(`"You also mentioned: '${noteSentences[1].replace(/\.$/, '')}.' Did that move forward?"`);
  pool.push(`"${first}, what's one thing you'd love an intro to right now?"`);
  pool.push(`"What's been the highlight of your month, work or otherwise?"`);

  const start = (seed * 3) % pool.length;
  return [0, 1, 2].map((i) => pool[(start + i) % pool.length]).filter((v, i, a) => a.indexOf(v) === i);
}

function withArticle(role: string) { return /^[aeiou]/i.test(role) ? `an ${role}` : `a ${role}`; }

export function findContactInText(text: string, contacts: Contact[]): Contact | undefined {
  const q = text.toLowerCase();
  return contacts.find((ct) => q.includes(ct.name.toLowerCase()) || q.includes(ct.name.split(' ')[0].toLowerCase()));
}
