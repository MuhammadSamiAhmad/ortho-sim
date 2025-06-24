import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Using Google Gemini API (free tier)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate the incoming request body
    const { message, category } = await req.json();
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let aiResponse = "";

    // 3. Check if the API key is configured
    if (GEMINI_API_KEY) {
      try {
        // --- START OF THE ADJUSTED CODE ---

        // Combine the system instructions and the user's message.
        // This is the standard way to provide a system prompt to the gemini-pro REST API.
        const fullPrompt = `You are an AI assistant specialized in orthopedic surgery education, particularly intramedullary nailing of the tibia. You help medical students and surgical residents learn surgical techniques, understand anatomy, and improve their skills. Provide accurate, educational, and helpful responses related to:

1.  Orthopedic surgery procedures
2.  Surgical anatomy
3.  Medical terminology
4.  Surgical techniques and best practices
5.  Post-operative care
6.  Complications and their management

Always emphasize the importance of proper training, supervision, and following established medical protocols. If asked about non-medical topics, politely redirect the conversation back to medical education.

---

User Question: ${message}`;

        // Make the fetch call to the Gemini API
        const response = await fetch(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // The 'contents' array holds the conversation.
              // For a single turn, we provide the full context here.
              contents: [
                {
                  role: "user",
                  parts: [{ text: fullPrompt }],
                },
              ],
              // Your generationConfig is perfectly fine.
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        // --- END OF THE ADJUSTED CODE ---

        if (response.ok) {
          const data = await response.json();
          // Safely extract the text from the response
          aiResponse =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I apologize, but I couldn't generate a response at this time. Please try rephrasing your question.";
        } else {
          // If the API returns a non-200 status, log the details for debugging
          const errorBody = await response.text();
          console.error(
            "Gemini API request failed:",
            response.status,
            errorBody
          );
          throw new Error(
            `Gemini API request failed with status ${response.status}`
          );
        }
      } catch (error) {
        console.error("Gemini API call error:", error);
        aiResponse =
          "I'm currently experiencing technical difficulties connecting to the AI service. Please try again later, or consult your mentor for immediate assistance with surgical questions.";
      }
    } else {
      // Fallback response when no API key is configured
      console.warn("GEMINI_API_KEY is not configured in .env.local");
      aiResponse =
        "I'm an AI assistant designed to help with orthopedic surgery education. However, the AI service is currently not configured. Please contact your system administrator or consult your mentor for assistance with surgical questions.";
    }

    // 4. Save the conversation to the database
    await prisma.aIChatLog.create({
      data: {
        userId: session.user.id,
        prompt: message,
        response: aiResponse,
        category: category || "general",
      },
    });

    // 5. Return the AI's response to the client
    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat POST API general error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message due to a server error." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    // Get chat history for the logged-in user
    const chatLogs = await prisma.aIChatLog.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    });

    // Format the logs before sending them to the client
    const formattedLogs = chatLogs.map((log) => ({
      id: log.id,
      prompt: log.prompt,
      response: log.response,
      timestamp: log.timestamp.toISOString(),
      category: log.category,
      rating: log.rating,
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Chat GET API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history." },
      { status: 500 }
    );
  }
}
