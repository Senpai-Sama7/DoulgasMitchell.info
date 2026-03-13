import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveAdminAiModel, getAdminAiSettings } from '@/lib/admin-ai';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';

export async function generateAltText(mediaId: string) {
  const media = await db.media.findUnique({ where: { id: mediaId } });
  if (!media || !media.url || media.category !== 'image') return null;

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const settings = await getAdminAiSettings();
  const activeModel = resolveAdminAiModel(settings);
  const genAI = new GoogleGenerativeAI(apiKey);

  // Note: For real production, we'd need to fetch the image bytes and pass to Gemini Vision
  // For this implementation, we describe the file context and ask for an architectural alt text
  const model = genAI.getGenerativeModel({
    model: activeModel,
    systemInstruction: `You are the "Architect" AI. Your task is to generate precise, professional, and descriptive alt text for images in Douglas Mitchell's portfolio. 
    Focus on architectural details, lighting, composition, and technical context. 
    Keep it under 150 characters.`,
  });

  try {
    // In a full implementation, we'd use multimodal: [{inlineData: {data: base64, mimeType}}]
    // Here we use the original name and metadata as a proxy if we don't want to fetch large buffers in this step
    const result = await model.generateContent(`Generate alt text for an image named: ${media.originalName}. 
    MIME: ${media.mimeType}. Dimensions: ${media.width}x${media.height}.`);
    
    const altText = result.response.text().trim().replace(/^"|"$/g, '');

    await db.media.update({
      where: { id: mediaId },
      data: { alt: altText }
    });

    await logActivity({
      action: 'UPDATE',
      resource: 'Media',
      resourceId: mediaId,
      details: { field: 'alt', value: altText }
    });

    return altText;
  } catch (error) {
    console.error('Alt text generation failed:', error);
    return null;
  }
}
