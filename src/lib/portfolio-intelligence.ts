import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveAdminAiModel, getAdminAiSettings } from '@/lib/admin-ai';

interface CaseStudyInput {
  title: string;
  description: string;
  metrics?: { label: string; value: string }[];
  technologies?: string[];
  role?: string;
  context?: string;
}

export async function generateCaseStudy(input: CaseStudyInput) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const settings = await getAdminAiSettings();
  const activeModel = resolveAdminAiModel(settings);
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: activeModel,
    systemInstruction: `You are the "Architect" Portfolio Strategist. Your task is to transform raw project data into a high-fidelity, deep-dive case study for a premium architectural-editorial portfolio.
    
    Structure the response in Markdown with these sections:
    1. **The Brief**: The core problem and context.
    2. **Architectural Approach**: The technical and strategic methodology.
    3. **Execution & Rigor**: How the solution was built and validated.
    4. **The Impact**: Key outcomes and metrics.
    5. **Retrospective**: Critical lessons learned.
    
    Tone: Precise, professional, minimal, and monospaced-inflected. Avoid hyperbole.
    Focus on "Operational Rigor", "AI Fluency", and "Human-Centered Design".`,
  });

  const prompt = `Draft a comprehensive case study for this project:
  Title: ${input.title}
  Description: ${input.description}
  Role: ${input.role || 'Lead Analyst/Architect'}
  Context: ${input.context || 'Strategic Initiative'}
  Technologies: ${input.technologies?.join(', ') || 'Modern Stack'}
  Metrics: ${input.metrics?.map(m => `${m.label}: ${m.value}`).join(', ') || 'N/A'}
  
  Ensure the markdown is clean, structurally sound, and ready for publication in a high-performance portfolio.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Case study generation failed:', error);
    return null;
  }
}
