import { GoogleGenAI, Type } from "@google/genai";
import { AreaOfLife } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const suggestHabits = async (
  goal: string, 
  existingHabits: string[]
): Promise<{ title: string; description: string; area: string; emoji: string }[]> => {
  const ai = getAI();
  if (!ai) return [];

  const prompt = `
    The user wants to build habits around this goal: "${goal}".
    They already have these habits: ${existingHabits.join(', ')}.
    
    Suggest 3 specific, small, actionable habits that are "homey", warm, and sustainable. 
    Avoid corporate jargon. Make them sound inviting.
    
    Return valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short catchy title (e.g. 'Morning Tea')" },
              description: { type: Type.STRING, description: "A warm, 1-sentence description of the habit." },
              area: { type: Type.STRING, description: "One of: Health, Career, Spirituality, Relationships, Finances, Creativity" },
              emoji: { type: Type.STRING, description: "A single emoji representing the habit" }
            },
            required: ["title", "description", "area", "emoji"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching habit suggestions:", error);
    return [];
  }
};

export const getDailyWisdom = async (
  completedCount: number, 
  areasWorkedOn: AreaOfLife[]
): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Every step forward is a step towards a blooming garden.";

  const areaStr = areasWorkedOn.length > 0 ? areasWorkedOn.join(", ") : "rest and preparation";
  
  const prompt = `
    You are a wise, gentle gardener of life. The user has completed ${completedCount} habits today, focusing on: ${areaStr}.
    Write a short, poetic, and encouraging message (max 2 sentences) comparing their progress to tending a garden or a cozy home.
    Be warm, not bossy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Your garden grows with patience and love.";
  } catch (error) {
    console.error("Gemini wisdom error:", error);
    return "Your garden grows with patience and love.";
  }
};

export const chatWithCoach = async (
  history: { role: 'user' | 'model', text: string }[],
  message: string
): Promise<string> => {
  const ai = getAI();
  if (!ai) return "I'm having trouble connecting to the wisdom source right now.";

  const systemInstruction = `
    You are "Sage", a cozy, non-judgmental, wise life coach. 
    Your persona is like a kind grandmother or a wise forest spirit.
    You help users build habits in Health, Career, Spirituality, Relationships, Finances.
    Avoid corporate speak (optimization, synergy, metrics). Use garden/nature/home metaphors.
    Keep answers concise (under 100 words) but warm.
  `;

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: { systemInstruction },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "";
  } catch (error) {
    console.error("Chat error:", error);
    return "The wind is blowing too hard, I cannot hear you clearly right now. Please try again later.";
  }
};
