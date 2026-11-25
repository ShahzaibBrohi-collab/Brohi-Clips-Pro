/* Brohi Clips Pro — Client-Side Gemini AI Engine (BYOK: Bring Your Own Key) */

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash-lite'
];

/**
 * Validates a user's personal Google Gemini API key
 */
export async function testKey(key) {
  if (!key || key.trim().length < 20) {
    throw new Error('Invalid API Key format. A valid Gemini key usually starts with AIzaSy...');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS[0]}:generateContent?key=${key.trim()}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping test' }] }] })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Key verification failed (HTTP ${res.status})`);
  }
  return true;
}

/**
 * Analyzes video content to detect viral short moments using the user's personal Gemini key
 */
export async function findMoments(videoContext, apiKey) {
  if (!apiKey || apiKey.trim().length < 20) {
    throw new Error('Gemini API Key missing! Please enter your own free Gemini key in Settings (get one free at aistudio.google.com)');
  }

  const cleanKey = apiKey.trim();
  const refId = Math.random().toString(36).substring(2, 8);
  const prompt = `[Ref:${refId}] You are an expert viral shorts and reels producer. Analyze the following video metadata and content to detect the top 3-5 most engaging, funny, or viral moments for a 30-60 second Short.

Video Content:
${videoContext}

Rules:
1. Always output timestamps strictly in "MM:SS" format (e.g. "01:25" to "02:00").
2. Each moment must be between 20 and 60 seconds long.
3. Return ONLY a valid JSON array of objects with keys:
   - "start": "MM:SS"
   - "end": "MM:SS"
   - "title": short catchy title
   - "hook": one punchy opening sentence for 3D narration
   - "score": virality score from 85 to 99

Example output:
[
  { "start": "01:10", "end": "01:45", "title": "Insane Comeback", "hook": "You won't believe how this ended!", "score": 97 }
]`;

  let lastErr = null;
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('AI did not return valid JSON');

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((m, i) => ({
        id: `moment-${Date.now()}-${i}`,
        startSec: parseMmSs(m.start),
        endSec: parseMmSs(m.end),
        startFormatted: m.start,
        endFormatted: m.end,
        title: m.title || `Viral Moment #${i + 1}`,
        hook: m.hook || 'Check out this epic highlight!',
        score: m.score || 92
      }));
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Failed to analyze moments with AI');
}

export function parseMmSs(str = '00:00') {
  const parts = String(str).trim().split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parseFloat(str) || 0;
}
