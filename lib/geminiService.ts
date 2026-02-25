import { GoogleGenAI } from '@google/genai';
import { Incident } from '../types';

export async function analyzeIncidents(incidents: Incident[]): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze the following website downtime incident logs and provide:
    1. An intelligent summary of the events.
    2. Risk detection (e.g., are there patterns of failure, specific times, or specific websites that are problematic?).
    3. Troubleshooting suggestions.

    Format the response in clear, concise paragraphs. Do not use markdown headers, just plain text with newlines separating sections.

    Incidents:
    ${JSON.stringify(incidents, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    return response.text || 'No analysis generated.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze incidents with Gemini API.');
  }
}
