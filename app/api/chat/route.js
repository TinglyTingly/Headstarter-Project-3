import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { HuggingFaceTransformersEmbeddigns } from "langchain/embeddings/hf_transformers";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// Load environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// System prompt for the AI assistant
const systemPrompt = "You are a helpful customer support assistant for Headstarter. Provide friendly, concise, and accurate responses to customer queries. If you're unsure about something, don't hesitate to ask for clarification.";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Knowledge base
const knowledgeBase = [
  "Headstarters is a 7 week fellowship.",
  "During the headstarter fellowship, teams consisting of 3 to 4 people may be formed.",
  "During the fellowship you are advised to be prepared to dedicate at least 20 hours of time to the fellowship.",
  "Each week there are mock interviews that accepted fellows can take part in and test their knowledge of data structures and algorithms.",
  "There will be occasional online and in person meet up in locations like New York and San Francisco", 
  "Accepted headstarter fellows will be broken into 3 tracks: Track A, Track B, and Track C.",
  "Track A is called The Entrepreneur Track and focuses on testing entrepreneurial spirit.",
  "Track B is known as The Tech Leader Track and aims to develop intrapreneurial skills.",
  "Track C is referred to as The Individual Contributor Track or the 'Google Engineer' track.",
  "Each track has different criteria for success, ranging from Bronze to Platinum levels.",
  "The fellowship includes hackathons, IRL meetups, and speaker series.",
  "This iteration of the fellowship is free, which contributed to its viral popularity.",
  "Track A's highest achievement (Platinum) is reaching 1000 daily active users with 50% L-ness.",
  "Track B encourages fellows to reach out to startups and offer to build features for free.",
  "Track C focuses on open-source contributions, with the highest achievement being a PR accepted by Panora.",
  "The fellowship offers an 'Overkill' option for those who want to go above and beyond.",
  "Overkill tasks include daily social media posting and obtaining AWS certifications.",
  "The fellowship curriculum is designed by professionals from companies like Google, Amazon, and YCombinator.",
  "Fellows are encouraged to network with each other, including weekly Zoom calls with random fellows.",
  "The fellowship aims to prepare participants for various career paths in tech, from entrepreneurship to FAANG jobs.",
  "Headstarter emphasizes the importance of user feedback and iterative development in Track A.",
  "Track B focuses on developing both technical and soft skills necessary for leadership roles in tech.",
  "The fellowship encourages participants to make decisions and take action rather than remaining indecisive.",
  "Headstarter provides opportunities for fellows to work on real-world projects and potentially secure job offers.",
  "The fellowship includes guest judges and speakers from notable tech companies and institutions.",
  "Headstarter aims to create a supportive community where fellows can learn from and help each other."
];

// embeddings model for the knowledge base
const embeddings = new HuggingFaceTransformersEmbeddigns({
  model: "sentence-transformers/all-MiniLM-L6-v2"
});

// intialize a mini vector store with the knowledge base
let vectorStore;

async function initializeVectorStore() {
  vectorStore = await MemoryVectorStore.fromTexts(
    knowledgeBase,
    knowledgeBase.map((_, i) => ({id: i})),
    embeddings
  );
}

// Initialize the vector store
initializeVectorStore();

// Searches the vector store for documents similar to a given query and returns the top 2 results
async function retrieveRelevantDocuments(query) {
  const relevantDocs = await vectorStore.similaritySearch(query, 2);
  return relevantDocs.map(doc => doc.pageContent).join("\n");
}

export async function POST(req) {
  const data = await req.json();
  const { messages } = data;

  return handleGeminiRequest(messages);
}

async function handleGeminiRequest(messages) {
  // Create a streaming completion request
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const latestMessage = messages[messages.length - 1].content;
    const retreievedInfo = await retrieveRelevantDocuments(latestMessage);
    
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

    const augmentedQuery = `
      Relevant information: ${relevantInfo}
      
      User query: ${latestMessage}
      
      Please respond to the user query using the relevant information provided above, if applicable. If the relevant information doesn't address the query, use your general knowledge to provide a helpful response.
    `;

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

for : import { HuggingFaceTransformersEmbeddigns } from "langchain/embeddings/hf_transformers";  AND import { MemoryVectorStore } from "langchain/vectorstores/memory";
do : npm install langchain @xenova/transformers
*/