
import { GoogleGenAI } from "@google/genai";
import { BrewPhase } from "../types";

const SYSTEM_INSTRUCTION = `You are an expert master brewer. 
You assist home brewers during their brew day. 
Keep answers concise, practical, and safe. 
If a user asks about temperatures, provide both Celsius and Fahrenheit.
The user is currently in a specific phase of brewing, so tailor your advice to that context.`;

export const getBrewAdvice = async (
  phase: BrewPhase, 
  userQuery: string, 
  brewContext: string
): Promise<string> => {
  
  // Always initialize with the pre-configured environment API key
  // We initialize GoogleGenAI inside the function call to ensure the latest API key from process.env is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current Phase: ${phase}. \nBrew Details: ${brewContext}. \nUser Question: ${userQuery}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    // The response.text is a getter property that returns the string output directly.
    return response.text || "I couldn't generate advice at this moment.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I'm having trouble connecting to the Brewmind.";
  }
};
