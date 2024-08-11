import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

// Authinticate with our api keys
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_SECRET_KEY,
});

// Global variable to hold the conversation history
let conversationHistory = [
  { role: "system", content: "You are a helpful assistant." },
];

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  // Update conversation history with the user's message
  conversationHistory.push({ role: "user", content: userMessage });

  try {
    // Request a completion from OpenAI based on the updated conversation history
    const completion = await openai.chat.completions.create({
      messages: conversationHistory,
      model: "gpt-3.5-turbo",
    });

    // Extract the response
    const botResponse = completion.choices[0].message.content;

    // Update conversation history with the assistant's response
    conversationHistory.push({ role: "assistant", content: botResponse });

    // Send the assistant's response back to the client
    res.json({ message: botResponse });
  } catch (error) {
    console.error("Error calling OpenAI: ", error);
    res.status(500).send("Error generating response from OpenAI");
  }
});

// Run the server
app.listen(PORT, console.log(`Server is running on port ${PORT}`));
