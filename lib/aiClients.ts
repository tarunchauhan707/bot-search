import axios from "axios";

export async function queryOpenAI(prompt: string) {
  const res = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  }, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });
  return res.data.choices[0].message.content;
}

export async function queryClaude(prompt: string) {
  const res = await axios.post("https://api.anthropic.com/v1/messages", {
    model: "claude-3-sonnet-20240229",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  }, {
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    }
  });
  return res.data.content[0].text;
}

export async function queryGemini(prompt: string) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );
  return res.data.candidates[0].content.parts[0].text;
}
