import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// System prompt for the AI assistant
const systemPrompt = "You are a helpful customer support assistant for Headstarter. Provide friendly, concise, and accurate responses to customer queries. If you're unsure about something, don't hesitate to ask for clarification.";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(req) {
  const data = await req.json();
  const { messages } = data;

  return handleGeminiRequest(messages);
}

async function handleGeminiRequest(messages) {
  // Create a streaming completion request
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: systemPrompt,
        },
        {
          role: "model",
          parts: "Understood, I will act as a helpful customer support assistant for Headstarter.",
        },
        ...messages.map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: msg.content,
        })),
      ],
    });

    const result = await chat.sendMessageStream(messages[messages.length - 1].content);

    // Set up a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}



/*
for : import { GoogleGenerativeAI } from "@google/generative-ai";
do : npm install @google/generative-ai
*/