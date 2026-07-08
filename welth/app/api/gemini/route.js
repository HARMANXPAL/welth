import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { image, mimeType } = await req.json();

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: image,
                mimeType: mimeType,
              },
            },
            {
              text: `Analyze this receipt image and extract the following information in JSON format:
              {
                "amount": (total amount as a number),
                "date": (date in ISO format YYYY-MM-DD),
                "description": (merchant name or description),
                "category": (one of: housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, travel, insurance, other-expense)
              }
              Only respond with valid JSON, no other text.`,
            },
          ],
        },
      ],
    });

    const text = response.text;
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleanedText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}