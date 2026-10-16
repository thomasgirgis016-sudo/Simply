// Vercel Serverless Function: /api/gemini
// Proxies requests to Google Gemini using central GEMINI_API_KEY configured in Vercel environment variables

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured in Vercel Environment Variables. Please set GEMINI_API_KEY in your Vercel project settings.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { model = 'gemini-1.5-flash', contents, generationConfig, systemInstruction } = body;

    // Use gemini-1.5-flash by default for reliable global uptime
    const targetModel = model.includes('2.5') ? model : 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey.trim()}`;

    const payload: any = { contents };
    if (generationConfig) payload.generationConfig = generationConfig;
    if (systemInstruction) {
      payload.systemInstruction = systemInstruction;
      payload.system_instruction = systemInstruction;
    }

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini upstream error:', data);
      return res.status(geminiRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
