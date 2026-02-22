import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// Initialize Gemini
// Note: In a real app, ensure GEMINI_API_KEY is set. 
// For this environment, it's injected via process.env.GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function analyzeContent(url: string, rawContent: string, mediaType: 'image' | 'video' | 'text' = 'text') {
  if (!ai) throw new Error("Gemini API Key not configured");

  const prompt = `
    Analyze this social media content.
    URL: ${url}
    Raw Content/Caption: ${rawContent}
    Media Type: ${mediaType}

    1. Extract the vibe and mood.
    2. Categorize it (e.g., Travel, Food, Tech, Fashion).
    3. Provide a concise 1-sentence summary.
    4. Generate 5-8 relevant tags for organization.
    5. If this is a video or image that looks like a specific location, identify where it might be.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { type: Type.STRING },
            vibe: { type: Type.STRING },
            location_hint: { type: Type.STRING, description: "A hint of the location if identifiable" }
          }
        }
      }
    });
    
    const text = result.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Content saved and indexed.",
      tags: ["Saved"],
      category: "General",
      vibe: "Neutral",
      location_hint: null
    };
  }
}

export async function findLocationOnMaps(locationQuery: string) {
  if (!ai) throw new Error("Gemini API Key not configured");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find detailed information about this location: ${locationQuery}. 
      Provide the address, a brief description, and why it's popular. 
      Also, provide a link to view this in Google Earth 3D if possible.`,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });

    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks,
      earth_link: `https://earth.google.com/web/search/${encodeURIComponent(locationQuery)}`
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return null;
  }
}

export async function chatWithKnowledgeBase(query: string, contextItems: any[]) {
  if (!ai) throw new Error("Gemini API Key not configured");

  const contextString = contextItems.map(item => 
    `- [${item.type}] ${item.summary} (Tags: ${JSON.parse(item.tags).join(', ')}, Vibe: ${item.vibe || 'N/A'}, Media: ${item.media_url || 'None'})`
  ).join('\n');

  const prompt = `
    You are a highly intelligent assistant for the "Social Saver" dashboard.
    The user has saved the following items:
    ${contextString}

    User Query: ${query}

    Answer the user's question based on their saved items. Use the 'Vibe' and 'Media' information to provide more context if relevant. If the answer isn't in the items, use your general knowledge but mention that it's not in their saves.
    Think deeply about the connections between their saved content.
  `;

  const result = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });
  
  return result.text;
}

export async function generateDigest(items: any[]) {
  if (!ai) throw new Error("Gemini API Key not configured");

  const itemsList = items.map(item => 
    `- ${item.summary} (Vibe: ${item.vibe})`
  ).join('\n');

  const prompt = `
    You are the editor of "The Social Saver Weekly".
    Create a fun, engaging, and short weekly digest newsletter based on the user's saved items from this week.
    
    Items:
    ${itemsList}

    Structure:
    1. 🌟 Theme of the Week (What's the overall vibe?)
    2. 💎 Hidden Gem (Pick one interesting item)
    3. 🚀 Actionable Tip (Based on the content)
    4. A short, encouraging closing.

    Use emojis and keep it snappy! Format as Markdown.
  `;

  const result = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt
  });

  return result.text;
}
