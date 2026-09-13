// Server-side proxy: the app calls this instead of the Gemini API directly, so
// the real API key only ever lives here (Netlify env var GEMINI_API_KEY),
// never in the client bundle. It forwards the request body as-is and returns
// Gemini's response as-is - the client-side parsing in gemini.ts is unchanged.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed.' } }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: { message: 'GEMINI_API_KEY is not configured on the server.' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: { message: 'Invalid JSON body.' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const { model, ...body } = payload as { model?: string; [k: string]: unknown };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model || 'gemini-2.5-flash'
  )}:generateContent?key=${encodeURIComponent(key)}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
  } catch {
    return new Response(JSON.stringify({ error: { message: 'Could not reach the Gemini API.' } }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
};
