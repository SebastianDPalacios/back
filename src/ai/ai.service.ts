// src/ai/ai.service.ts
import fetch from 'node-fetch';
import { env } from '../config/env';

type GeminiResp = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};
type DeepSeekResp = {
  choices?: Array<{ message?: { content?: string } }>;
};

export async function summarize(text: string): Promise<string> {
  try {
    if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text }] }] }),
        }
      );
      if (!r.ok) throw new Error(`gemini ${r.status}`);
      const data = (await r.json()) as GeminiResp;   // ⬅️ tipado explícito
      const out = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (out) return out;
    }

    if (env.AI_PROVIDER === 'deepseek' && env.DEEPSEEK_API_KEY) {
      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          temperature: 0.3,
          messages: [{ role: 'user', content: text }],
        }),
      });
      if (!r.ok) throw new Error(`deepseek ${r.status}`);
      const data = (await r.json()) as DeepSeekResp; // ⬅️ tipado explícito
      const out = data.choices?.[0]?.message?.content?.trim();
      if (out) return out;
    }
  } catch {
    // cae al fallback
  }

  // ✅ Fallback determinista para que SIEMPRE haya respuesta
  const lines = text.split('\n').filter((l) => l.trim());
  const head = lines.slice(0, 6).map((l) => `- ${l}`);
  return ['Resumen (fallback):', ...head].join('\n');
}
