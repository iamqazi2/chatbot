import { NextResponse } from "next/server";

export async function GET() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        status: "fallback",
        message: "No API key configured",
      });
    }

    // Test connection to Gemini API with a simple request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates[0]) {
        return NextResponse.json({
          status: "connected",
          message: "Gemini API connected successfully",
        });
      } else {
        return NextResponse.json({
          status: "fallback",
          message: "API response format unexpected",
        });
      }
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        status: "fallback",
        message: `API error: ${response.status} - ${errorText}`,
      });
    }
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({
      status: "fallback",
      message: `Connection test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}
