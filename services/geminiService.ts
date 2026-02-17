
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FaceShape } from "../types";

export async function analyzeFaceShape(base64Image: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

    const result = JSON.parse(response.text);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image. Please ensure the face is clear and well-lit.");
  }
}

export async function generateInspirationImage(shape: FaceShape, tips: { hair: string; glasses: string }): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    
    if (!imageUrl) throw new Error("No image data returned");
    return imageUrl;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
}
