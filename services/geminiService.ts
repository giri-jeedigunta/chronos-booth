
import { GoogleGenAI, Type } from "@google/genai";
import { PhotoAnalysis } from "../types";

const extractBase64Data = (base64String: string): string => {
  const parts = base64String.split(',');
  return parts.length > 1 ? parts[1] : base64String;
};

export const analyzePhoto = async (base64Image: string): Promise<PhotoAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: extractBase64Data(base64Image),
          },
        },
        {
          text: 'Analyze this photo and provide a brief summary of the person, their key features, and the overall vibe. Return the result in JSON format.'
        }
      ]
    }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          detectedFeatures: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          vibe: { type: Type.STRING }
        },
        required: ['summary', 'detectedFeatures', 'vibe']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No analysis received from AI.");
  return JSON.parse(text);
};

export const travelToEra = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: extractBase64Data(base64Image),
          },
        },
        { text: prompt },
      ],
    }],
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Manifestation failed. Quantum sync error.");
};

export const editPhoto = async (base64Image: string, editPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: extractBase64Data(base64Image),
          },
        },
        {
          text: `Modify the image according to this instruction: ${editPrompt}. Maintain the subjects likeness and the historical context.`
        },
      ],
    }],
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Refinement failed.");
};
