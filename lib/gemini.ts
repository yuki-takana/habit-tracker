import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

const ACTIVE_PROVIDER: string = "groq";

const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.7,
});

const grokModel = new ChatOpenAI({
  apiKey: process.env.GROK_API_KEY || "",
  configuration: {
    baseURL: "https://api.x.ai/v1",
  },
  modelName: "grok-2-latest",
  temperature: 0.7,
});

const groqModel = new ChatOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  configuration: {
    baseURL: "https://api.groq.com/openai/v1",
  },
  modelName: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

export const model =
  ACTIVE_PROVIDER === "groq"
    ? groqModel
    : ACTIVE_PROVIDER === "grok"
      ? grokModel
      : geminiModel;