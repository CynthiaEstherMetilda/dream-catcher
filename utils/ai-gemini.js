
import { GoogleGenAI } from '@google/genai';

export async function getDreamInterpretation(dreamText) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    // Initialize Gemini after checking the API key
    const ai = new GoogleGenAI({ apiKey });

    console.log('Calling Gemini model:', model);

    const response = await ai.models.generateContent({
      model,
      contents: `Dream: ${dreamText}`,
      config: {
        systemInstruction:
          'You are a thoughtful dream interpreter. Be insightful but gentle, and consider common dream symbolism. Keep your interpretation to 2-3 paragraphs.'
      }
    });

    const interpretation = response.text;

    if (!interpretation) {
      throw new Error('Gemini returned an empty response');
    }

    return interpretation.trim();

  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
