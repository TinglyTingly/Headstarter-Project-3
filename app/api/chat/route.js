import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Light Weight TF-IDF Vectorizer Class
class TdidfVectorizer {
  constructor() {
    this.vocabulary = new Set();
    this.documentFrequency = {};
    this.idfValues = {};
    this.documents = [];
  }

  fit(documents) {
    this.documents = documents;
    documents.forEach((doc, docIndex) => {
      const words = doc.toLowerCase().split(/\W+/);
      const uniqueWords = new Set(words);
      uniqueWords.forEach(word => {
        this.vocabulary.add(word);
        this.documentFrequency[word] = (this.documentFrequency[word] || 0) + 1;
      });
    });

    this.vocabulary.forEach(word => {
      this.idfValues[word] = Math.log(documents.length / (this.documentFrequency[word] || 1));
    });
  }

  transform(document) {
    const words = document.toLowerCase().split(/\W+/);
    const vector = {};
    words.forEach(word => {
      if (this.vocabulary.has(word)) {
        vector[word] = (vector[word] || 0) + 1;
      }
    });
    Object.keys(vector).forEach(word => {
      vector[word] *= this.idfValues[word];
    });
    return vector;
  }
}

// Light Weight Vector Store
class SimpleVectorStore {
  constructor() {
    this.vectors = [];
    this.vectorizer = new TdidfVectorizer();
  }

  async addDocuments(documents) {
    this.vectorizer.fit(documents);
    this.vectors = documents.map(doc => ({
      content: doc,
      vector: this.vectorizer.transform(doc)
    }));
  }

  async similaritySearch(query, k = 2) {
    const queryVector = this.vectorizer.transform(query);
    const scores = this.vectors.map(doc => ({
      content: doc.content,
      score: this.cosineSimilarity(queryVector, doc.vector)
    }));
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k);
  }

  cosineSimilarity(vec1, vec2) {
    const intersection = Object.keys(vec1).filter(word => vec2.hasOwnProperty(word));
    const dotProduct = intersection.reduce((sum, word) => sum + vec1[word] * vec2[word], 0);
    const mag1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (mag1 * mag2);
  }
}

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

// Initialize vector store
let vectorStore;

async function initializeVectorStore() {
  if (!vectorStore) {
    console.log("Initializing vector store...");
    vectorStore = new SimpleVectorStore();
    await vectorStore.addDocuments(knowledgeBase);
    console.log("Vector store initialized!");
  }
}

// Searches the vector store for documents similar to a given query and returns the top 2 results
async function retrieveRelevantDocuments(query) {
  await initializeVectorStore();
  const relevantDocs = await vectorStore.similaritySearch(query, 2);
  return relevantDocs.map(doc => doc.content).join("\n");
}

export async function POST(req) {
  try {
    const messages = await req.json();
    console.log("Received data:", JSON.stringify(messages, null, 2));

    // Validate the messages array
    if (!messages){
      throw new Error("Messages is not defined or No messages provided");
    }
    if (!Array.isArray(messages)) {
      throw new Error("Messages is not an array");
    }
    if (messages.length === 0) {
      throw new Error("Messages array is empty");
    }
    
    return handleGeminiRequest(messages);
  } catch (error) {
    console.error("Error in POST:", error);
    return new NextResponse(JSON.stringify({ error: error.message || "An error occurred" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleGeminiRequest(messages) {
  // Create a streaming completion request
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const latestMessage = messages[messages.length - 1].content;
    if (typeof latestMessage !== 'string') {
      throw new Error("Latest message content is not a string");
    }

    const retrievedInfo = await retrieveRelevantDocuments(latestMessage);
    
    // Format the chat history correctly for Gemini
    const formattedHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood, I will act as a helpful customer support assistant for Headstarter." }] },
        ...formattedHistory,
      ],
    });

    const augmentedQuery = `
      Relevant information: ${retrievedInfo}
      
      User query: ${latestMessage}
      
      Please respond to the user query using the relevant information provided above, if applicable. If the relevant information doesn't address the query, use your general knowledge to provide a helpful response.
    `;

    const result = await chat.sendMessage(augmentedQuery);
    const response = await result.response;
    const text = response.text();

    // Return the response as a stream
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
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

// Note: You only need to install @google/generative-ai for this version
// npm install @google/generative-ai