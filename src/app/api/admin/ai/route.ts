import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: '[SYSTEM ERROR] Missing Google Gemini API key in environment.' });
    }

    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `You are the System Architect AI for Douglas Mitchell's portfolio admin portal. Keep responses concise, professional, and slightly futuristic/monospaced. The user is asking: ${message}` }] }]
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return NextResponse.json({ reply: `[API ERROR] ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '[SYSTEM] No response generated.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ reply: '[SYSTEM ERROR] Neural Net connection dropped.' }, { status: 500 });
  }
}
