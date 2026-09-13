// Farbwelt: warmes Papier mit Salbei-Akzent.
export const c = {
  bg: '#EFECE6',          // Seitenhintergrund
  surface: '#FDFBF7',     // Kacheln, Karten, Header
  surfaceSoft: '#F6F3EE', // Eingabefelder, dezente Flächen
  line: '#E8E3DB',        // feine Trennlinien
  border: '#DDD7CD',      // Rahmen
  borderStrong: '#CFC8BC',

  text: '#3E3835',
  text2: '#544D48',
  textSecondary: '#7A726B',
  textMuted: '#9A928A',
  onDark: '#FDFBF7',      // Text auf dunklen Flächen
  onDarkSoft: '#D9D2C7',

  accent: '#A3B18A',      // Flächen, aktive Elemente
  accentDark: '#6F7F5A',  // Text und Icons in Akzentfarbe (lesbar auf hell)
  accentDeep: '#4F5C3F',
  accentSoft: '#EEF1E6',  // Hintergründe
  accentSoft2: '#E2E8D4',
  accentBorder: '#CBD3B8',

  danger: '#B5563F',
  dangerDark: '#9E4632',
  dangerSoft: '#F7E9E4',
  dangerBorder: '#E7C3B7',

  gold: '#C7A24D',        // Favoriten-Stern
  goldSoft: '#F7F0E1',
  goldBorder: '#E8D9AE',
};

export const r = { md: 10, lg: 12, xl: 16, xxl: 20, full: 999 };

// Gedämpfte Avatar-Töne, passend zur Palette.
const avatarMap: Record<string, string> = {
  'bg-indigo-600': '#7B8AA6',
  'bg-amber-600': '#C7A24D',
  'bg-blue-600': '#6E8CA8',
  'bg-emerald-600': '#7E9A72',
  'bg-rose-600': '#B5706A',
  'bg-violet-600': '#8E7FA3',
};

export function avatarBg(cls?: string): string {
  return (cls && avatarMap[cls]) || c.accentDark;
}

export type BadgeColors = { bg: string; text: string; border: string };

export function reminderColors(status: 'overdue' | 'today' | 'upcoming' | 'none', days: number): BadgeColors {
  switch (status) {
    case 'overdue': return { bg: c.dangerSoft, text: c.dangerDark, border: c.dangerBorder };
    case 'today': return { bg: c.goldSoft, text: c.text2, border: c.goldBorder };
    case 'upcoming':
      return days <= 7
        ? { bg: c.accentSoft, text: c.accentDeep, border: c.accentBorder }
        : { bg: c.surfaceSoft, text: c.textSecondary, border: c.border };
    default: return { bg: c.surfaceSoft, text: c.textMuted, border: c.border };
  }
}

export function priorityColors(p: 'high' | 'medium' | 'low'): BadgeColors {
  if (p === 'high') return { bg: c.dangerSoft, text: c.dangerDark, border: c.dangerBorder };
  if (p === 'medium') return { bg: c.goldSoft, text: c.text2, border: c.goldBorder };
  return { bg: c.surfaceSoft, text: c.textSecondary, border: c.border };
}
