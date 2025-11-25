import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSmartReplies = async (incomingMessage: string): Promise<string[]> => {
  if (!apiKey) return ["Ok", "Got it", "Can't talk right now"];

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a smart reply system for a secure messenger app.
      The user received this message: "${incomingMessage}".
      Generate 3 short, contextually appropriate responses.
      Return ONLY the 3 responses separated by pipes (|).
      Example: Yes, I agree|Sounds good|I'll check later
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text || '';
    return text.split('|').map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
  } catch (error) {
    console.error("Gemini Smart Reply Error:", error);
    return ["👍", "Roger that", "Ok"];
  }
};

export const rewriteMessage = async (draft: string, tone: 'professional' | 'friendly' | 'concise'): Promise<string> => {
  if (!apiKey) return draft;

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Rewrite the following message to be more ${tone}: "${draft}"`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text?.trim() || draft;
  } catch (error) {
    console.error("Gemini Rewrite Error:", error);
    return draft;
  }
};

export const chatWithGemini = async (history: {role: 'user' | 'model', text: string}[], newMessage: string): Promise<string> => {
  if (!apiKey) return "Gemini API key is missing.";

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful assistant inside the OffNetWalkie messenger app. Keep answers concise and helpful.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I couldn't process that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Error connecting to AI service.";
  }
};
