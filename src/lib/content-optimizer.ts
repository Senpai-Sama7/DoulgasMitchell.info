import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveAdminAiModel, getAdminAiSettings } from '@/lib/admin-ai';

export async function analyzeContent(content: string, type: 'Article' | 'Project' | 'Note') {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const settings = await getAdminAiSettings();
  const activeModel = resolveAdminAiModel(settings);
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: activeModel,
    systemInstruction: `You are the "Architect" AI Content Optimizer. Your task is to analyze the provided ${type} content and suggest improvements for SEO, readability, and engagement. 
    Provide your analysis in the following JSON format:
    {
      "score": number (0-100),
      "suggestions": string[],
      "seoKeywords": string[],
      "alternativeTitles": string[],
      "crossLinkSuggestions": string[]
    }
    Maintain an editorial-architectural perspective: precise, minimal, and high-impact.`,
  });

  try {
    const result = await model.generateContent(`Analyze this ${type} content:\n\n${content}`);
    const text = result.response.text();
    // Clean JSON if model wrapped it in code blocks
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Content optimization failed:', error);
    return null;
  }
}
