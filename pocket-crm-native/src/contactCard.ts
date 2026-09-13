import { SocialMediaLinks, UserProfile } from '../types';

// Jede Nutzerin hat einen eigenen QR-Code. Er enthält das Profil als kurze URL
// mit dem App-Schema aus app.json, damit ein Scan die App öffnen kann.
// Kurze Schlüssel halten den Code klein und damit gut scannbar.
const PREFIX = 'pocketcrm://contact';

export type ContactCard = {
  name: string;
  role: string;
  company: string;
  email?: string;
  location?: string;
  socialLinks: SocialMediaLinks;
};

const SOCIAL_KEYS: [string, keyof SocialMediaLinks][] = [
  ['li', 'linkedin'],
  ['tw', 'twitter'],
  ['ig', 'instagram'],
  ['w', 'website'],
  ['gh', 'github'],
];

// Je kürzer der Text, desto weniger Module hat der QR-Code und desto besser
// lässt er sich vom Bildschirm abscannen. `:` `/` `@` `,` sind in einem
// Query-Wert erlaubt und müssen nicht maskiert werden; Leerzeichen werden `+`.
function encodeValue(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(/%3A/gi, ':')
    .replace(/%2F/gi, '/')
    .replace(/%40/gi, '@')
    .replace(/%2C/gi, ',');
}

export function buildContactCard(profile: UserProfile): string {
  const sl = profile.socialLinks || {};
  const pairs: [string, string | undefined][] = [
    ['n', profile.name],
    ['r', profile.jobTitle],
    ['c', profile.company],
    ['e', profile.email],
    ['l', profile.location],
    ...SOCIAL_KEYS.map(([short, key]) => [short, sl[key]] as [string, string | undefined]),
  ];
  const query = pairs
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}=${encodeValue(v!.trim())}`)
    .join('&');
  return query ? `${PREFIX}?${query}` : PREFIX;
}

export function parseContactCard(input: string): ContactCard | null {
  const match = input.trim().match(/^pocketcrm:\/\/contact\?(.+)$/i);
  if (!match) return null;

  const q: Record<string, string> = {};
  for (const pair of match[1].split('&')) {
    const eq = pair.indexOf('=');
    if (eq < 1) continue;
    const key = pair.slice(0, eq);
    const raw = pair.slice(eq + 1).replace(/\+/g, ' ');
    try { q[key] = decodeURIComponent(raw); } catch { q[key] = raw; }
  }

  const name = q.n?.trim();
  if (!name) return null;

  const socialLinks: SocialMediaLinks = {};
  for (const [short, key] of SOCIAL_KEYS) {
    if (q[short]?.trim()) socialLinks[key] = q[short].trim();
  }

  return {
    name,
    role: q.r?.trim() ?? '',
    company: q.c?.trim() ?? '',
    email: q.e?.trim() || undefined,
    location: q.l?.trim() || undefined,
    socialLinks,
  };
}
