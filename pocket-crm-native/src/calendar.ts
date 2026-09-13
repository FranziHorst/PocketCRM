import { Platform } from 'react-native';
import { CrmEvent } from '../types';

export const CALENDAR_ID_PREFIX = 'cal_';

export type CalendarSyncResult =
  | { ok: true; events: CrmEvent[] }
  | { ok: false; reason: 'unavailable' | 'denied' };

const DAYS_BACK = 90;
const DAYS_AHEAD = 30;

const pad = (n: number) => String(n).padStart(2, '0');

// Device events carry a timestamp, the CRM stores plain days. Convert in local
// time so an evening event does not slip into the next day in UTC.
function toLocalDay(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isCalendarEvent(event: CrmEvent): boolean {
  return event.id.startsWith(CALENDAR_ID_PREFIX);
}

// Loaded lazily so Expo Go, where the native module is missing, fails on tap
// with a message instead of crashing the whole app at startup.
export async function loadDeviceEvents(): Promise<CalendarSyncResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'unavailable' };

  let Calendar: typeof import('expo-calendar');
  try {
    Calendar = await import('expo-calendar');
  } catch {
    return { ok: false, reason: 'unavailable' };
  }

  try {
    const perm = await Calendar.requestCalendarPermissions();
    if (!perm.granted) return { ok: false, reason: 'denied' };

    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - DAYS_BACK);
    const to = new Date(now);
    to.setDate(to.getDate() + DAYS_AHEAD);

    const calendars = await Calendar.getCalendars(
      Platform.OS === 'ios' ? Calendar.EntityTypes.EVENT : undefined
    );
    const raw = await Calendar.listEvents(calendars, from, to);

    const events: CrmEvent[] = [];
    const seen = new Set<string>();
    for (const e of raw) {
      const name = (e.title || '').trim();
      if (!name) continue;
      const startDate = toLocalDay(e.startDate);
      const endDate = toLocalDay(e.endDate);
      // A recurring series repeats one device id across occurrences, so the day
      // is part of the key: meeting someone belongs to a date, not to a series.
      const id = `${CALENDAR_ID_PREFIX}${e.id}_${startDate}`;
      if (seen.has(id)) continue;
      seen.add(id);
      events.push({
        id,
        name,
        startDate,
        ...(endDate !== startDate ? { endDate } : {}),
        ...(e.location ? { location: e.location } : {}),
        source: 'calendar',
      });
    }
    return { ok: true, events };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
