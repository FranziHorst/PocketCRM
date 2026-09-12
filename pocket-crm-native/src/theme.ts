// Farbpalette (Tailwind-Werte der Web-App), damit das Design grob erhalten bleibt.
export const c = {
  white: '#ffffff',
  slate50: '#f8fafc', slate100: '#f1f5f9', slate200: '#e2e8f0', slate300: '#cbd5e1',
  slate400: '#94a3b8', slate500: '#64748b', slate600: '#475569', slate700: '#334155',
  slate800: '#1e293b', slate900: '#0f172a',
  indigo50: '#eef2ff', indigo100: '#e0e7ff', indigo200: '#c7d2fe', indigo400: '#818cf8',
  indigo500: '#6366f1', indigo600: '#4f46e5', indigo700: '#4338ca', indigo800: '#3730a3', indigo900: '#312e81',
  violet50: '#f5f3ff', violet100: '#ede9fe', violet200: '#ddd6fe', violet600: '#7c3aed', violet700: '#6d28d9',
  amber50: '#fffbeb', amber100: '#fef3c7', amber200: '#fde68a', amber300: '#fcd34d', amber400: '#fbbf24',
  amber500: '#f59e0b', amber600: '#d97706', amber700: '#b45309', amber800: '#92400e', amber900: '#78350f',
  rose50: '#fff1f2', rose100: '#ffe4e6', rose200: '#fecdd3', rose500: '#f43f5e', rose600: '#e11d48', rose700: '#be123c',
  emerald50: '#ecfdf5', emerald100: '#d1fae5', emerald200: '#a7f3d0', emerald300: '#6ee7b7',
  emerald500: '#10b981', emerald600: '#059669', emerald700: '#047857',
  blue50: '#eff6ff', blue100: '#dbeafe', blue200: '#bfdbfe', blue600: '#2563eb', blue700: '#1d4ed8',
  pink50: '#fdf2f8', pink700: '#be185d',
};

export const r = { md: 8, lg: 12, xl: 16, xxl: 20, full: 999 };

const avatarMap: Record<string, string> = {
  'bg-indigo-600': c.indigo600,
  'bg-amber-600': c.amber600,
  'bg-blue-600': c.blue600,
  'bg-emerald-600': c.emerald600,
  'bg-rose-600': c.rose600,
  'bg-violet-600': c.violet600,
};

// mockData speichert Avatar-Farben als Tailwind-Klassen; hier die Umsetzung in Hex.
export function avatarBg(cls?: string): string {
  return (cls && avatarMap[cls]) || c.indigo600;
}

export type BadgeColors = { bg: string; text: string; border: string };

export function reminderColors(status: 'overdue' | 'today' | 'upcoming' | 'none', days: number): BadgeColors {
  switch (status) {
    case 'overdue': return { bg: c.rose50, text: c.rose700, border: c.rose200 };
    case 'today': return { bg: c.amber50, text: c.amber800, border: c.amber300 };
    case 'upcoming':
      return days <= 7
        ? { bg: c.blue50, text: c.blue700, border: c.blue200 }
        : { bg: c.slate50, text: c.slate600, border: c.slate200 };
    default: return { bg: c.slate100, text: c.slate500, border: c.slate200 };
  }
}

export function priorityColors(p: 'high' | 'medium' | 'low'): BadgeColors {
  if (p === 'high') return { bg: c.rose50, text: c.rose700, border: c.rose100 };
  if (p === 'medium') return { bg: c.amber50, text: c.amber700, border: c.amber100 };
  return { bg: c.slate100, text: c.slate600, border: c.slate100 };
}
