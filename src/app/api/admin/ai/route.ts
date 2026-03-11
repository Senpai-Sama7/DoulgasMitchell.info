import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: 'You are the "Architect" AI for Douglas Mitchell\'s portfolio platform. Your purpose is to assist the administrator in managing content, analyzing site performance, and providing technical guidance. Maintain a precise, professional, and slightly futuristic tone. Responses should be formatted in clean markdown. Always assume you are speaking to the owner/architect, Douglas Mitchell.',
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ reply: '[SYSTEM ERROR] Neural Net connection dropped.' }, { status: 500 });
  }
}
