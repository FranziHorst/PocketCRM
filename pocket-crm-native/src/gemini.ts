// Calls go through our own Netlify Function (netlify/functions/gemini.mts)
// instead of Google directly, so the real API key stays server-side and is
// never part of the app bundle. Direct REST there too (no SDK): SDKs pull in
// Node polyfills that Metro does not resolve.

const SITE_ORIGIN = process.env.EXPO_PUBLIC_SITE_ORIGIN ?? 'https://pocketcrm-ai-hackathon.netlify.app';
const PROXY_URL = `${SITE_ORIGIN}/.netlify/functions/gemini`;
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-3.6-flash';

// The key lives on the server now, not in this build - whether AI actually
// answers depends on the deploy having GEMINI_API_KEY set, not on this client.
export function geminiConfigured(): boolean {
  return true;
}

export type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args?: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

export type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

export type GeminiFunctionDeclaration = {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
};

export type WebSource = { title: string; uri: string };

export type GeminiResult = {
  text: string;
  calls: { name: string; args: Record<string, unknown> }[];
  parts: GeminiPart[];
  sources: WebSource[];
};

type RequestOptions = {
  contents: GeminiContent[];
  systemInstruction?: string;
  functions?: GeminiFunctionDeclaration[];
  webSearch?: boolean;
  temperature?: number;
};

export class GeminiError extends Error {}

// Grounding and function declarations cannot be combined in one request, so
// callers pick one: the assistant loop declares functions, search_web grounds.
async function call(opts: RequestOptions): Promise<GeminiResult> {
  const tools: Record<string, unknown>[] = [];
  if (opts.webSearch) tools.push({ google_search: {} });
  else if (opts.functions?.length) tools.push({ functionDeclarations: opts.functions });

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      contents: opts.contents,
      ...(opts.systemInstruction ? { systemInstruction: { parts: [{ text: opts.systemInstruction }] } } : {}),
      ...(tools.length ? { tools } : {}),
      generationConfig: { temperature: opts.temperature ?? 0.7 },
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new GeminiError(body?.error?.message || `Gemini request failed (${res.status}).`);
  }

  const candidate = body?.candidates?.[0];
  const parts: GeminiPart[] = candidate?.content?.parts ?? [];

  const text = parts
    .map((p) => ('text' in p ? p.text : ''))
    .join('')
    .trim();

  const calls = parts.flatMap((p) =>
    'functionCall' in p ? [{ name: p.functionCall.name, args: p.functionCall.args ?? {} }] : []
  );

  const seen = new Set<string>();
  const sources: WebSource[] = [];
  for (const chunk of candidate?.groundingMetadata?.groundingChunks ?? []) {
    const uri: string | undefined = chunk?.web?.uri;
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({ uri, title: chunk.web.title || uri });
  }

  return { text, calls, parts, sources };
}

export function generate(opts: Omit<RequestOptions, 'webSearch'>): Promise<GeminiResult> {
  return call(opts);
}

export function searchWeb(query: string): Promise<GeminiResult> {
  return call({
    contents: [{ role: 'user', parts: [{ text: query }] }],
    systemInstruction:
      'Answer the search request from current web results. Be factual and brief: a few short sentences or bullets, no filler.',
    webSearch: true,
    temperature: 0.2,
  });
}
