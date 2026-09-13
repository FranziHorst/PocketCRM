import { Contact, CrmEvent, TagSuggestion } from '../types';
import { getReminderInfo } from '../crmHelpers';
import { AssistantCtx, AssistantReply, GeminiError, geminiConfigured, runAssistant } from './assistant';

export type { AssistantAction, AssistantCtx, AssistantReply } from './assistant';
export { geminiConfigured } from './assistant';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function askAssistant(
  message: string,
  ctx: AssistantCtx,
  history: { sender: 'user' | 'assistant'; text: string }[] = []
): Promise<AssistantReply> {
  if (!geminiConfigured()) return { text: await demoReply(message, ctx) };
  try {
    return await runAssistant(message, ctx, history);
  } catch (err) {
    const detail = err instanceof GeminiError ? err.message : 'Check your connection and try again.';
    return { text: `I couldn't reach the AI service.\n\n${detail}` };
  }
}

// Kept so the app still answers without an API key: same shapes, canned text.
async function demoReply(message: string, ctx: AssistantCtx): Promise<string> {
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

// TODO(KI): Platzhalter. Zieht die Kontaktfelder per Muster aus dem gesprochenen Text.
// Später ersetzt die echte KI nur diese Funktion; die Signatur kann bleiben.
export type ExtractedContact = {
  name: string; role: string; company: string; howWeMet: string; notes: string;
  // eventId: passendes bestehendes Event gefunden. newEventName: kein Match, aber ein
  // Event wurde erwähnt und sollte neu angelegt werden (macht der Aufrufer, extractContact
  // selbst veraendert keinen State).
  eventId?: string;
  newEventName?: string;
};

const ROLES = [
  'product designer', 'ux designer', 'ui designer', 'graphic designer', 'designer',
  'software engineer', 'frontend engineer', 'backend engineer', 'engineer', 'developer',
  'co-founder', 'cofounder', 'founder', 'ceo', 'cto', 'coo', 'cmo', 'vp',
  'product manager', 'project manager', 'manager', 'angel investor', 'investor',
  'data scientist', 'scientist', 'researcher', 'analyst', 'marketer', 'consultant',
  'director', 'architect', 'writer', 'recruiter', 'partner', 'advisor', 'student', 'professor',
];

const EVENT_WORDS = 'conference|meetup|summit|event|workshop|hackathon|party|dinner|drinks|panel|expo|fair|retreat|mixer|launch|webinar';

// Wörter, die nie Teil eines Namens sind – sonst wird aus „met at the party“ ein Name.
const NAME_STOP = new Set([
  'at', 'in', 'on', 'the', 'a', 'an', 'with', 'up', 'this', 'that', 'from', 'during', 'and',
  'her', 'him', 'them', 'my', 'our', 'some', 'someone', 'today', 'yesterday', 'last', 'again',
  'who', 'she', 'he', 'they', 'it', 'was', 'is', 'for', 'about', 'to',
]);

// Häufige großgeschriebene Wörter, die kein Name sind (Satzanfang, Ausrufe, Ortsangaben).
const CAP_STOP = new Set([
  'i', 'she', 'he', 'they', 'we', 'this', 'that', 'so', 'and', 'but', 'well', 'ok', 'okay',
  'just', 'also', 'then', 'today', 'yesterday', 'her', 'him', 'them', 'met', 'talked', 'spoke',
]);

// „at all“, „from work“ usw. sehen wie eine Firma aus, sind aber keine.
const COMPANY_REJECT = new Set([
  'all', 'home', 'work', 'once', 'first', 'last', 'least', 'most', 'night', 'lunch', 'coffee',
  'breakfast', 'school', 'university', 'college', 'now', 'then', 'me', 'us', 'them', 'there', 'here',
]);

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function takeName(raw: string): string {
  const words: string[] = [];
  for (const word of raw.split(/\s+/)) {
    const clean = word.replace(/[^a-zA-Z'’-]/g, '');
    if (!clean || NAME_STOP.has(clean.toLowerCase())) break;
    words.push(clean);
    if (words.length === 2) break;
  }
  return titleCase(words.join(' '));
}

// Fallback, falls kein Signalwort ("met", "this is", …) einen Namen liefert: die erste
// großgeschriebene Wortfolge im Text nehmen. Deckt natürliche Sätze ab, in denen der
// Name zuerst genannt wird und später nur noch per Pronomen darauf verwiesen wird
// ("Sarah Miller is a product designer, I met her at SaaStr").
function findCapitalizedName(text: string): string {
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i += 1) {
    const clean = words[i].replace(/[^a-zA-Z'’-]/g, '');
    if (!clean || !/^[A-Z][a-z'’-]*$/.test(clean) || CAP_STOP.has(clean.toLowerCase())) continue;
    const next = (words[i + 1] ?? '').replace(/[^a-zA-Z'’-]/g, '');
    if (next && /^[A-Z][a-z'’-]*$/.test(next) && !CAP_STOP.has(next.toLowerCase())) {
      return titleCase(`${clean} ${next}`);
    }
    return titleCase(clean);
  }
  return '';
}

export function extractContact(text: string, events: CrmEvent[] = []): ExtractedContact {
  const notes = text.trim().replace(/\s+/g, ' ');
  // Notes bekommen eine Zusammenfassung, nicht den vollen Rohtext - eine gesprochene
  // Notiz ist meist unaufgeraeumter als getippte Notizen.
  const out: ExtractedContact = { name: '', role: '', company: '', howWeMet: '', notes: summarizeNotes(notes, 220) };
  if (!notes) return out;

  const nameMatch = notes.match(
    /\b(?:met with|met|talked to|spoke to|spoke with|ran into|bumped into|introduced to|this is|named|(?:his|her|their) name is)\s+(.+)/i
  );
  if (nameMatch) out.name = takeName(nameMatch[1]);
  if (!out.name) out.name = findCapitalizedName(notes);

  // Erst das Event herausziehen, damit „at the SaaStr conference“ oder „at TechCrunch
  // Disrupt“ nicht als Firma gilt. Zuerst gegen bereits angelegte Events matchen (die
  // kennen wir sicher), erst danach mit den generischen Event-Woertern raten.
  let rest = notes;
  const existingEvent = events
    .filter((e) => e.name && new RegExp(`\\b${escapeRegExp(e.name)}\\b`, 'i').test(notes))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (existingEvent) {
    out.eventId = existingEvent.id;
    out.howWeMet = existingEvent.name;
    // "at/during (the/a/an)?" mit entfernen, sonst bleibt z.B. "the" als Firma haengen.
    rest = notes.replace(new RegExp(`\\b(?:(?:at|during)\\s+(?:(?:the|a|an)\\s+)?)?${escapeRegExp(existingEvent.name)}`, 'i'), ' ');
  } else {
    const eventMatch = notes.match(new RegExp(`\\b(?:at|during)\\s+(?:(?:the|a|an)\\s+)?([^.,;]*?\\b(?:${EVENT_WORDS})\\b)`, 'i'));
    if (eventMatch) {
      const name = titleCase(eventMatch[1].trim());
      out.newEventName = name;
      out.howWeMet = name;
      rest = notes.replace(eventMatch[0], ' ');
    }
  }

  const roleMatch = rest.match(new RegExp(`\\b((?:senior|junior|lead|principal|staff|head of|chief)\\s+)?(${ROLES.join('|')})\\b`, 'i'));
  if (roleMatch) out.role = titleCase(`${roleMatch[1] ?? ''}${roleMatch[2]}`.trim());

  // An ein Rollen-/Arbeits-Wort gebunden ("founder at X", "works at X"), damit ein
  // bloßes "met her at X" (X = Ort/Event) nicht faelschlich als Firma gilt.
  const companyMatch = rest.match(new RegExp(`\\b(?:${ROLES.join('|')}|works?|working)\\s+(?:at|for|from)\\s+([^.,;]+)`, 'i'));
  if (companyMatch) {
    const words = companyMatch[1].trim().split(/\s+/).slice(0, 3);
    const stopAt = words.findIndex((w) => /^(and|but|she|he|they|we|who|which|last|this|about|on|in|as)$/i.test(w));
    const picked = (stopAt === -1 ? words : words.slice(0, stopAt)).join(' ');
    const isJunk = COMPANY_REJECT.has(picked.toLowerCase()) || new RegExp(EVENT_WORDS, 'i').test(picked);
    if (picked && !isJunk) {
      out.company = titleCase(picked);
      rest = rest.replace(companyMatch[0], ' ');
    }
  }

  // Letzter Fallback fuer ein neues Event ohne generisches Event-Wort ("met her at
  // TechCrunch Disrupt"): eine großgeschriebene Wortfolge nach "at/during", wenn vorher
  // im Satz ein Kennenlern-Wort stand. Firma ist an dieser Stelle schon entfernt.
  if (!existingEvent && !out.newEventName && /\b(?:met|ran into|bumped into|talked to|spoke to|spoke with|saw|caught up with)\b/i.test(rest)) {
    const looseEventMatch = rest.match(/\b(?:at|during)\s+(?:(?:the|a|an)\s+)?([A-Z][A-Za-z'’-]*(?:\s+[A-Z][A-Za-z'’-]*){0,3})/);
    if (looseEventMatch) {
      const name = titleCase(looseEventMatch[1].trim());
      out.newEventName = name;
      out.howWeMet = name;
    }
  }

  if (!out.howWeMet) out.howWeMet = 'Captured by voice note';
  return out;
}

export function findContactInText(text: string, contacts: Contact[]): Contact | undefined {
  const q = text.toLowerCase();
  return contacts.find((ct) => q.includes(ct.name.toLowerCase()) || q.includes(ct.name.split(' ')[0].toLowerCase()));
}
