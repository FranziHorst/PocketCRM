export type LinkedInProfile = { url: string; slug: string; nameGuess: string };

// LinkedIn QR codes contain only the profile URL (e.g. https://www.linkedin.com/in/maya-lin-4a2b1).
// Role and company are not included, so we can only prefill the link and a name guess.
export function parseLinkedInUrl(input: string): LinkedInProfile | null {
  const text = input.trim();
  const m = text.match(/linkedin\.com\/in\/([A-Za-z0-9%._-]+)/i);
  if (!m) return null;
  const slug = decodeURIComponent(m[1]).replace(/\/+$/, '');
  const url = `https://www.linkedin.com/in/${slug}`;
  const words = slug
    .split('-')
    .filter((w) => w && !/\d/.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return { url, slug, nameGuess: words.join(' ') };
}
