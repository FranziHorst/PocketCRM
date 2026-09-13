import { Contact, CrmEvent, DailyTask, UserProfile } from '../types';
import { calculateNextReminder, getReminderInfo } from '../crmHelpers';
import { GeminiContent, GeminiError, WebSource, generate, geminiConfigured, searchWeb } from './gemini';

export type AssistantCtx = {
  userProfile: UserProfile;
  contacts: Contact[];
  tasks: DailyTask[];
  events: CrmEvent[];
};

// The assistant never writes to the store itself. It proposes one change, the
// chat renders a confirm card, and only the tap applies it.
export type AssistantAction =
  | { kind: 'saveContact'; label: string; contact: Contact }
  | { kind: 'addTask'; label: string; task: DailyTask }
  | { kind: 'toggleTask'; label: string; taskId: string };

export type AssistantReply = { text: string; action?: AssistantAction; sources?: WebSource[] };

export { geminiConfigured };

const MAX_STEPS = 5;

const STRING = { type: 'string' } as const;

const READ_TOOLS = [
  {
    name: 'list_contacts',
    description:
      'List contacts from the CRM. Use before answering anything about who the user knows or who needs attention.',
    parameters: {
      type: 'object',
      properties: {
        filter: { type: 'string', enum: ['all', 'due', 'favorites'], description: 'due = overdue or due today' },
        query: { ...STRING, description: 'Optional text to match against name, role, company, tags or notes.' },
      },
    },
  },
  {
    name: 'get_contact',
    description: 'Full details for one contact: notes, tags, how they met, reminder status, linked event.',
    parameters: { type: 'object', properties: { name: STRING }, required: ['name'] },
  },
  {
    name: 'list_tasks',
    description: 'List the follow-up tasks on the user’s list.',
    parameters: {
      type: 'object',
      properties: { include_completed: { type: 'boolean' } },
    },
  },
  {
    name: 'search_web',
    description:
      'Search the live web. Use for company news, funding rounds, recent posts or anything not stored in the CRM.',
    parameters: { type: 'object', properties: { query: STRING }, required: ['query'] },
  },
];

const WRITE_TOOLS = [
  {
    name: 'update_contact',
    description:
      'Propose a change to an existing contact. The user confirms it before it is saved. Only pass the fields that change.',
    parameters: {
      type: 'object',
      properties: {
        name: { ...STRING, description: 'Name of the contact to change.' },
        notes: { ...STRING, description: 'Replaces the notes. To extend them, repeat the existing text plus the addition.' },
        role: STRING,
        company: STRING,
        add_tags: { type: 'array', items: STRING },
        reminder_cadence: { type: 'string', enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'none'] },
        mark_contacted_today: { type: 'boolean', description: 'Set when the user says they just spoke to them.' },
        favorite: { type: 'boolean' },
      },
      required: ['name'],
    },
  },
  {
    name: 'add_task',
    description: 'Propose a new follow-up task. The user confirms it before it is added.',
    parameters: {
      type: 'object',
      properties: {
        title: STRING,
        contact_name: { ...STRING, description: 'Contact this task is about, if any.' },
        due_date: { ...STRING, description: 'YYYY-MM-DD. Defaults to today.' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        type: { type: 'string', enum: ['follow-up', 'coffee', 'intro', 'prep', 'other'] },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_task',
    description: 'Propose marking a task as done. The user confirms it.',
    parameters: { type: 'object', properties: { title: STRING }, required: ['title'] },
  },
];

function today() {
  return new Date().toISOString().split('T')[0];
}

function systemInstruction(ctx: AssistantCtx): string {
  const p = ctx.userProfile;
  const open = ctx.tasks.filter((t) => !t.completed).length;
  return [
    `You are Pocket Copilot, the networking assistant inside ${p.name}'s personal CRM.`,
    `About them: ${p.jobTitle} at ${p.company}, based in ${p.location}. Goals: ${p.networkingGoals.join(', ') || 'none set'}.`,
    `Today is ${today()}. They have ${ctx.contacts.length} contacts and ${open} open tasks.`,
    '',
    'How to work:',
    '- Look things up with the tools instead of guessing. The CRM is the source of truth for people, the web is for anything outside it.',
    '- To change something, call the matching tool. The user gets a confirm card, so propose the change instead of asking for permission in text.',
    '- Only one change per reply. If more are needed, do the first and say what comes next.',
    '- Keep replies short and mobile-sized. Draft messages ready to send, no preamble like "Sure!" or "Here you go".',
    '- Never invent contacts, notes or facts. If the CRM has no answer, say so.',
  ].join('\n');
}

function findContact(ctx: AssistantCtx, name: string): Contact | undefined {
  const q = String(name ?? '').trim().toLowerCase();
  if (!q) return undefined;
  return (
    ctx.contacts.find((ct) => ct.name.toLowerCase() === q) ??
    ctx.contacts.find((ct) => ct.name.toLowerCase().includes(q) || q.includes(ct.name.toLowerCase())) ??
    ctx.contacts.find((ct) => ct.name.split(' ')[0].toLowerCase() === q)
  );
}

function briefContact(ct: Contact, ctx: AssistantCtx) {
  const info = getReminderInfo(ct);
  const event = ct.eventId ? ctx.events.find((e) => e.id === ct.eventId) : undefined;
  return {
    name: ct.name,
    role: ct.role,
    company: ct.company,
    tags: ct.tags,
    how_we_met: ct.howWeMet,
    met_at_event: event?.name,
    notes: ct.notes,
    last_contacted: ct.lastContacted,
    reminder: `${info.status} (${info.label})`,
    favorite: !!ct.isFavorite,
  };
}

type ToolOutcome = { result: Record<string, unknown>; sources?: WebSource[] } | { action: AssistantAction };

async function runTool(name: string, args: Record<string, any>, ctx: AssistantCtx): Promise<ToolOutcome> {
  switch (name) {
    case 'list_contacts': {
      const q = String(args.query ?? '').trim().toLowerCase();
      let list = ctx.contacts;
      if (args.filter === 'due') {
        list = list.filter((ct) => ['overdue', 'today'].includes(getReminderInfo(ct).status));
      } else if (args.filter === 'favorites') {
        list = list.filter((ct) => ct.isFavorite);
      }
      if (q) {
        list = list.filter((ct) =>
          `${ct.name} ${ct.role} ${ct.company} ${ct.tags.join(' ')} ${ct.notes}`.toLowerCase().includes(q)
        );
      }
      return {
        result: {
          count: list.length,
          contacts: list.slice(0, 40).map((ct) => ({
            name: ct.name,
            role: ct.role,
            company: ct.company,
            tags: ct.tags,
            reminder: getReminderInfo(ct).label,
          })),
        },
      };
    }

    case 'get_contact': {
      const ct = findContact(ctx, args.name);
      if (!ct) return { result: { error: `No contact named "${args.name}".` } };
      return { result: briefContact(ct, ctx) };
    }

    case 'list_tasks': {
      const list = args.include_completed ? ctx.tasks : ctx.tasks.filter((t) => !t.completed);
      return {
        result: {
          count: list.length,
          tasks: list.map((t) => ({
            title: t.title,
            about: t.contactName,
            due: t.dueDate,
            priority: t.priority,
            done: t.completed,
          })),
        },
      };
    }

    case 'search_web': {
      const res = await searchWeb(String(args.query ?? ''));
      return { result: { answer: res.text || 'No usable results.' }, sources: res.sources };
    }

    case 'update_contact': {
      const ct = findContact(ctx, args.name);
      if (!ct) return { result: { error: `No contact named "${args.name}". List the contacts first.` } };

      const changes: string[] = [];
      const next: Contact = { ...ct };
      if (typeof args.notes === 'string' && args.notes.trim() && args.notes.trim() !== ct.notes) {
        next.notes = args.notes.trim();
        changes.push('notes');
      }
      if (typeof args.role === 'string' && args.role.trim() && args.role.trim() !== ct.role) {
        next.role = args.role.trim();
        changes.push(`role → ${next.role}`);
      }
      if (typeof args.company === 'string' && args.company.trim() && args.company.trim() !== ct.company) {
        next.company = args.company.trim();
        changes.push(`company → ${next.company}`);
      }
      const added = (Array.isArray(args.add_tags) ? args.add_tags : [])
        .map((x: unknown) => String(x).trim())
        .filter((x: string) => x && !ct.tags.includes(x));
      if (added.length) {
        next.tags = [...ct.tags, ...added];
        changes.push(`tags: ${added.join(', ')}`);
      }
      if (args.reminder_cadence && args.reminder_cadence !== ct.reminderCadence) {
        next.reminderCadence = args.reminder_cadence;
        next.nextReminderDate = calculateNextReminder(next.reminderCadence);
        changes.push(`reminder → ${next.reminderCadence}`);
      }
      if (args.mark_contacted_today) {
        next.lastContacted = today();
        next.nextReminderDate = calculateNextReminder(next.reminderCadence);
        changes.push('last contacted → today');
      }
      if (typeof args.favorite === 'boolean' && args.favorite !== !!ct.isFavorite) {
        next.isFavorite = args.favorite;
        changes.push(args.favorite ? 'marked favourite' : 'removed from favourites');
      }

      if (!changes.length) return { result: { error: 'Nothing would change on that contact.' } };
      return { action: { kind: 'saveContact', label: `Update ${ct.name}: ${changes.join(', ')}`, contact: next } };
    }

    case 'add_task': {
      const title = String(args.title ?? '').trim();
      if (!title) return { result: { error: 'A task needs a title.' } };
      const ct = args.contact_name ? findContact(ctx, args.contact_name) : undefined;
      const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(args.due_date ?? '') ? args.due_date : today();
      const task: DailyTask = {
        id: `t_${Date.now()}`,
        title,
        ...(ct ? { contactId: ct.id, contactName: ct.name } : {}),
        dueDate,
        completed: false,
        priority: args.priority ?? 'medium',
        type: args.type ?? 'follow-up',
      };
      return { action: { kind: 'addTask', label: `Add task: ${title}${ct ? ` (${ct.name})` : ''}`, task } };
    }

    case 'complete_task': {
      const q = String(args.title ?? '').trim().toLowerCase();
      const task = ctx.tasks.find((t) => !t.completed && t.title.toLowerCase().includes(q));
      if (!task) return { result: { error: `No open task matching "${args.title}".` } };
      return { action: { kind: 'toggleTask', label: `Mark done: ${task.title}`, taskId: task.id } };
    }

    default:
      return { result: { error: `Unknown tool ${name}.` } };
  }
}

export async function runAssistant(
  message: string,
  ctx: AssistantCtx,
  history: { sender: 'user' | 'assistant'; text: string }[] = []
): Promise<AssistantReply> {
  const contents: GeminiContent[] = history.slice(-8).map((h) => ({
    role: h.sender === 'user' ? 'user' : 'model',
    parts: [{ text: h.text }],
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const sources: WebSource[] = [];
  const functions = [...READ_TOOLS, ...WRITE_TOOLS];

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await generate({ contents, systemInstruction: systemInstruction(ctx), functions });

    if (!res.calls.length) {
      const text = res.text || "I didn't get that. Could you say it another way?";
      return { text, ...(sources.length ? { sources } : {}) };
    }

    contents.push({ role: 'model', parts: res.parts });
    const responses: GeminiContent['parts'] = [];

    for (const c of res.calls) {
      const outcome = await runTool(c.name, c.args, ctx);
      if ('action' in outcome) {
        // A write ends the turn: the user confirms before anything is stored.
        return {
          text: res.text || outcome.action.label,
          action: outcome.action,
          ...(sources.length ? { sources } : {}),
        };
      }
      if (outcome.sources) sources.push(...outcome.sources);
      responses.push({ functionResponse: { name: c.name, response: outcome.result } });
    }

    contents.push({ role: 'user', parts: responses });
  }

  return { text: 'That took more steps than I can do in one go. Try asking for one thing at a time.' };
}

export { GeminiError };
