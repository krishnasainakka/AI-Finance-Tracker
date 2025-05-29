import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// In-memory chat history store: { userId: [ { role, parts } ] }
const sessionHistories = {};

// System prompt that stays constant for all sessions
const SYSTEM_PROMPT = {
  role: "model",
  parts: [
    {
      text:
        "You are a helpful and friendly budgeting coach that gives personal finance advice to users in their 20s. Be realistic, practical, and encouraging. Your tone should be chill, supportive, and easy to understand — no finance jargon unless you explain it.",
    },
  ],
};

// POST /ask
router.post("/ask", async (req, res) => {
  const { message, userId } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "Missing userId or message." });
  }

  try {
    // Initialize session history if not exists, start with system prompt
    if (!sessionHistories[userId]) {
      sessionHistories[userId] = [SYSTEM_PROMPT];
    }

    // Append the user's current message to history
    sessionHistories[userId].push({
      role: "user",
      parts: [{ text: message }],
    });

    // Create chat with full accumulated history for this user session
    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: sessionHistories[userId],
    });

    // Send message and get response
    const response = await chat.sendMessage({ message });

    const reply = response.text;

    // Append assistant's reply to session history
    sessionHistories[userId].push({
      role: "model",
      parts: [{ text: reply }],
    });

    res.json({ reply });
  } catch (err) {
    console.error("❌ Gemini error:", err);
    res.status(500).json({ error: "Failed to get response from Gemini." });
  }
});

// Optional: clear user session history manually if needed
router.post("/clear-session", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId." });

  delete sessionHistories[userId];
  res.json({ message: "Session history cleared." });
});

export default router;
