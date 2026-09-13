// Direct REST calls instead of a Google SDK: the SDKs pull in Node polyfills
// that Metro does not resolve, and we only need two endpoints.

const API = 'https://generativelanguage.googleapis.com/v1beta/models';

const KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-2.5-flash';

export function geminiConfigured(): boolean {
  return KEY.length > 0;
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
  if (!KEY) throw new GeminiError('No API key configured.');

  const tools: Record<string, unknown>[] = [];
  if (opts.webSearch) tools.push({ google_search: {} });
  else if (opts.functions?.length) tools.push({ functionDeclarations: opts.functions });

  const res = await fetch(`${API}/${MODEL}:generateContent?key=${encodeURIComponent(KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
