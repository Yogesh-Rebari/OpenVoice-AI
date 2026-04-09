import { GoogleGenAI, Type } from "@google/genai";
import { ComplaintContext, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are the AI assistant for "OpenVoice AI – Anonymous Complaint & Issue Reporting System".
Your goal is to help users submit clear, structured, and anonymous complaints.

CORE WORKFLOW:
1. Understand User Input: Extract issue, location, time, category.
2. Ask Smart Follow-Up: If info is missing, ask 1-2 concise questions.
3. Classify IMMEDIATELY: As soon as the user mentions an issue, you MUST predict the Category and Subcategory. 
   - Categories: Roads, Electricity, Water, Safety, Sanitation, Others.
   - Subcategories: Be specific (e.g., Pothole, Power Outage, Leak, Theft, Trash).
   - Priority: Predict HIGH, MEDIUM, or LOW based on urgency.
4. Generate Summary: Once sufficient details are collected, generate a summary and ask for confirmation.

IMPORTANT: 
- ALWAYS try to fill the "category" and "subcategory" fields in the updatedContext. 
- If you are unsure, make your best guess based on the user's initial description. 
- DO NOT leave them empty if an issue has been described.

ANONYMITY RULES:
- NEVER ask for name or personal details.
- Optionally allow contact info, but never require it.

RESPONSE FORMAT:
You must ALWAYS respond with a JSON object matching this schema:
{
  "reply": "Your conversational response to the user",
  "updatedContext": {
    "issue": "string",
    "category": "string",
    "subcategory": "string",
    "location": "string",
    "time": "string",
    "severity": "string",
    "description": "string",
    "priority": "HIGH | MEDIUM | LOW"
  },
  "isReadyForSummary": boolean,
  "isSubmitted": boolean
}

If the user says "submit" after reviewing the summary, set isSubmitted to true.
`;

export async function processMessage(
  messages: Message[],
  currentContext: ComplaintContext
): Promise<{
  reply: string;
  updatedContext: ComplaintContext;
  isReadyForSummary: boolean;
  isSubmitted: boolean;
}> {
  // Limit history to last 10 messages to keep context window clean and avoid truncation
  const history = messages.slice(-10).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { role: 'user', parts: [{ text: `Current Context: ${JSON.stringify(currentContext)}` }] },
      ...history
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          updatedContext: {
            type: Type.OBJECT,
            properties: {
              issue: { type: Type.STRING },
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              location: { type: Type.STRING },
              time: { type: Type.STRING },
              severity: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { 
                type: Type.STRING,
                enum: ["HIGH", "MEDIUM", "LOW"]
              }
            }
          },
          isReadyForSummary: { type: Type.BOOLEAN },
          isSubmitted: { type: Type.BOOLEAN }
        },
        required: ["reply", "updatedContext", "isReadyForSummary", "isSubmitted"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text);
    return {
      ...result,
      updatedContext: {
        ...currentContext,
        ...result.updatedContext
      }
    };
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      reply: "I'm sorry, I encountered an error processing your request. Could you please try again?",
      updatedContext: currentContext,
      isReadyForSummary: false,
      isSubmitted: false
    };
  }
}
