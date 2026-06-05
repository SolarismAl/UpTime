import { GoogleGenAI, Type } from '@google/genai';
import { Incident } from '../types';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "An intelligent summary of the events",
    },
    riskLevel: {
      type: Type.STRING,
      description: "Risk level (e.g. Low, Medium, High) based on patterns",
    },
    troubleshootingSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Troubleshooting suggestions",
    },
  },
  required: ["summary", "riskLevel", "troubleshootingSteps"],
};

export async function analyzeIncidents(incidents: Incident[]): Promise<any> {
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

    Incidents:
    ${JSON.stringify(incidents, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze incidents with Gemini API.');
  }
}
