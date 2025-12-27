
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

export const getMentorResponse = async (
  messages: ChatMessage[], 
  activeModule?: { title: string; description: string },
  progress?: { completedModules: string[], totalCompletion: number }
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const moduleContext = activeModule 
      ? `The student is currently focused on the module: "${activeModule.title}". 
         Module Description: ${activeModule.description}.`
      : "The student is exploring the general roadmap.";

    const progressContext = progress
      ? `The student has mastered the following modules: ${progress.completedModules.join(', ') || 'None yet'}.
         Their overall roadmap completion is ${progress.totalCompletion}%.`
      : "";

    const systemInstruction = `
      You are a Senior Front-End Engineer and AI Engineer Mentor. 
      Your tone is encouraging, professional, and practical. 
      You are helping a student follow a specific learning roadmap:
      - Foundations -> Front-End -> AI Fundamentals -> AI+FE Integration -> Career.
      
      Student Progress Context:
      ${moduleContext}
      ${progressContext}

      Tailor your advice specifically to their current level and progress. 
      Answer questions clearly, provide code snippets where helpful (using Tailwind and React), 
      and suggest next steps based on the roadmap.
      Keep responses concise but insightful. 
      If they ask about a project, guide them through the logic rather than just giving the solution.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // If it's a 500 error, it might be an internal RPC issue. We'll return a more descriptive local message.
    return "I'm experiencing a temporary connection issue with my neural circuits (Gemini API 500). Please try again in a few moments!";
  }
};

export const generateProjectIdea = async (module: { title: string; difficulty: string; topics: string[] }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const prompt = `Suggest one unique, creative, and highly practical coding project for a student in the module "${module.title}".
    Difficulty Level: ${module.difficulty}.
    Core Topics: ${module.topics.join(', ')}.
    The project should be achievable in 1-2 weeks and demonstrate mastery of the listed topics.
    Format your response as a JSON object with 'title', 'description', and 'features' (array).`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'description', 'features']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as { title: string; description: string; features: string[] };
  } catch (error) {
    console.error("Project Generation Error:", error);
    throw error;
  }
};
