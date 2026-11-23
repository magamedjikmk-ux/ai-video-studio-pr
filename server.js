import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    project: "AI VIDEO STUDIO PRO",
    openai_key_connected: Boolean(process.env.OPENAI_API_KEY),
  });
});

app.get("/api/idea", async (req, res) => {
  try {
    const topic = req.query.topic || "будущее технологий";

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `Придумай короткую идею ролика и сценарий на 15 секунд по теме: "${topic}". Ответь кратко на русском языке.`,
    });

    res.json({
      topic,
      idea: response.output_text,
    });
  } catch (error) {
    res.status(500).json({
      error: "Ошибка запроса к OpenAI API",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
