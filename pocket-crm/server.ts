import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client with telemetry header
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Agent Chat endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history = [], userProfile, crmSummary } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getAIClient();

    const systemInstruction = `You are "Pocket Copilot", a high-EQ, concise personal CRM networking assistant for ${
      userProfile?.name || "the user"
    } (a 31-year-old active professional networker who values genuine relationships).
Your job is to help them:
1. Reconnect thoughtfully with contacts and maintain strong network momentum.
2. Craft personalized, warm, and natural follow-up messages (for LinkedIn, email, or WhatsApp) that sound human, never generic.
3. Prepare quick briefing notes or icebreakers before coffee chats or calls.
4. Keep answers punchy, conversational, and directly actionable (ideal for a mobile screen and text-to-speech voice playback).
5. Suggest strategic tags, follow-up cadence, or relationship advice.

Current CRM Context:
- User Profile: ${JSON.stringify(userProfile || {})}
- Active Network & Pending Reminders: ${crmSummary || "No active contacts specified"}

Keep your tone friendly, encouraging, and sharp. When drafting a message, provide ready-to-send copy with minimal friction.`;

    // Format chat contents
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add recent history if present (limit to last 8 messages)
    if (Array.isArray(history)) {
      const recent = history.slice(-8);
      for (const h of recent) {
        if (h.sender === "user" || h.role === "user") {
          contents.push({ role: "user", parts: [{ text: h.text || h.content || "" }] });
        } else if (h.sender === "assistant" || h.role === "model") {
          contents.push({ role: "model", parts: [{ text: h.text || h.content || "" }] });
        }
      }
    }

    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm here to help you strengthen your network! What's on your mind?";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/gemini/chat:", error);
    return res.status(500).json({
      error: error?.message || "Failed to communicate with AI agent",
    });
  }
});

// AI Tag Suggester endpoint
app.post("/api/gemini/suggest-tags", async (req, res) => {
  try {
    const { name, company, role, meetingNotes, relationship, socialProfiles } = req.body;

    const ai = getAIClient();

    const prompt = `Analyze this CRM contact and suggest 3 to 6 high-relevance, clean tags for quick organization and search.
Contact details:
- Name: ${name || "Unknown"}
- Title/Role: ${role || "Unknown"}
- Company/Org: ${company || "Unknown"}
- Relationship / Context: ${relationship || "Professional contact"}
- Meeting Notes & Background: ${meetingNotes || "None"}
- Social Profiles: ${JSON.stringify(socialProfiles || {})}

Return a JSON array of tag objects. Each object should have:
- "tag": short tag name (1-3 words, e.g., "Angel Investor", "Met @ SaaStr", "AI Engineering", "Coffee Chat", "Warm Intro", "Alumni")
- "reason": brief reason (under 10 words)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tag: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["tag", "reason"],
          },
        },
      },
    });

    let tags = [];
    try {
      tags = JSON.parse(response.text || "[]");
    } catch {
      tags = [
        { tag: "Professional", reason: "General contact" },
        { tag: "Network", reason: "Personal connection" },
      ];
    }

    return res.json({ tags });
  } catch (error: any) {
    console.error("Error in /api/gemini/suggest-tags:", error);
    return res.status(500).json({
      error: error?.message || "Failed to suggest tags",
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pocket CRM Server running on port ${PORT}`);
  });
}

startServer();
