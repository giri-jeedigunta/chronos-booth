
import { GoogleGenAI, Type } from "@google/genai";
import { PhotoAnalysis } from "../types";

export const analyzePhoto = async (base64Image: string): Promise<PhotoAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: 'Analyze this photo and provide a brief summary of the person, their key features (like hair color, expression, clothing style), and the overall vibe of the photo. Return the result in JSON format.'
        }
      ]
    },
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
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: prompt
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate time-travel photo.");
};

export const editPhoto = async (base64Image: string, editPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `Apply this edit to the image: ${editPrompt}. Maintain the person and the general scene, but modify as requested.`
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to edit photo.");
};
