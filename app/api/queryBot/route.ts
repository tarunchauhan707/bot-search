import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// OpenAI query
async function queryOpenAI(prompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "OpenAI Error");
  return data.choices?.[0]?.message?.content || "No response";
}

// Claude query
async function queryClaude(prompt: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-2.1",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Claude Error");
  return data.completion || "No response";
}

// Gemini query using gemini-2.0-flash model and v1beta API
async function queryGemini(prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Gemini Error");
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

// POST handler
export async function POST(req: NextRequest) {
  const { bot, prompt } = await req.json();
  let result = "⚠️ Error";

  try {
    if (bot === "openai") result = await queryOpenAI(prompt);
    else if (bot === "claude") result = await queryClaude(prompt);
    else if (bot === "gemini") result = await queryGemini(prompt);
    else result = "Unknown bot";
  } catch (err) {
    console.error(`API error for ${bot}:`, err);
    result = `❌ Failed to query ${bot}: ${err instanceof Error ? err.message : err}`;
  }

  return NextResponse.json({ response: result });
}
