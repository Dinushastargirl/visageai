
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FaceShape } from "../types";

/**
 * Helper to safely get the API key from the environment.
 */
const getApiKey = () => {
  const key = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!key) {
    console.error("API_KEY is missing from process.env");
  }
  return key || "";
};

export async function analyzeFaceShape(base64Image: string): Promise<AnalysisResult> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API configuration missing. Please check your environment variables.");

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this human face image and determine its face shape (Oval, Round, Square, Heart, Diamond, or Oblong).
    Identify key facial landmarks for the overlay:
    - hairline_top
    - forehead_left, forehead_right
    - cheekbone_left, cheekbone_right
    - jaw_left, jaw_right
    - chin_bottom
    
    Return the analysis in valid JSON format. Provide coordinates (x, y) as percentages (0-100) relative to the image dimensions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shape: { type: Type.STRING, description: "One of: Oval, Round, Square, Heart, Diamond, Oblong" },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" },
            description: { type: Type.STRING, description: "Short clinical description of the face structure" },
            landmarks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER }
                },
                required: ["label", "x", "y"]
              }
            },
            tips: {
              type: Type.OBJECT,
              properties: {
                glasses: { type: Type.STRING },
                hair: { type: Type.STRING },
                makeup: { type: Type.STRING }
              }
            }
          },
          required: ["shape", "confidence", "description", "landmarks", "tips"]
        }
      }
    });

    if (!response.text) throw new Error("Empty response from AI model.");
    const result = JSON.parse(response.text);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image. Ensure the face is clear and the API key is correctly configured in Vercel.");
  }
}

export async function generateInspirationImage(shape: FaceShape, tips: { hair: string; glasses: string }): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return ""; // Fail silently for inspiration image if key missing

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Create a professional, high-fashion aesthetic portrait of a person with a perfectly ${shape} face shape.
    Styling instructions to incorporate:
    - Hair: ${tips.hair}
    - Eyewear: ${tips.glasses}
    The style should be clean, modern, and provide visual inspiration for grooming and fashion. 
    Focus on the facial structure and how the styling complements it. Soft studio lighting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    let imageUrl = "";
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    
    if (!imageUrl) throw new Error("No image data returned from model.");
    return imageUrl;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
}
