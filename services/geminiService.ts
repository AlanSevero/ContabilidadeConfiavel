
import { GoogleGenAI } from "@google/genai";

// Safe access to process.env to prevent "process is not defined" crashes in browser
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("API Key access failed", e);
  }
  return '';
};

const apiKey = getApiKey();
// Only initialize AI if key exists to prevent immediate crash
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const enhanceDescription = async (rawText: string): Promise<string> => {
  if (!ai) return rawText;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Improve and expand the following service or product description for a formal business invoice (Nota Fiscal) in Brazilian Portuguese. Make it professional, clear, and concise. Do not add conversational text, just return the improved description.
      
      Raw text: "${rawText}"`,
    });

    return response.text?.trim() || rawText;
  } catch (error) {
    console.error("Error enhancing description:", error);
    return rawText; // Fallback to original text
  }
};

export const suggestTaxCategory = async (description: string): Promise<string> => {
  if (!ai) return 'Geral';
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following description, suggest a general category for this item/service in Portuguese (e.g., Consultoria, Venda de Produto, Manutenção, etc). Keep it to 1-2 words.
      
      Description: "${description}"`,
    });
    return response.text?.trim() || 'Geral';
  } catch (error) {
    return 'Geral';
  }
}
