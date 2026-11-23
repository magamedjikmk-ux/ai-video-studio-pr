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

const htmlPage = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI VIDEO STUDIO PRO</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body {
      background: #0b0f19;
      color: #f3f4f6;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 16px;
    }
    .container {
      width: 100%;
      max-width: 680px;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      background: rgba(139, 92, 246, 0.18);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.4);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(90deg, #a78bfa, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }
    .subtitle {
      color: #9ca3af;
      font-size: 14px;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #d1d5db;
      margin-bottom: 8px;
    }
    input, select {
      width: 100%;
      background: #0b0f19;
      border: 1px solid #374151;
      color: #fff;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 15px;
      margin-bottom: 16px;
      outline: none;
    }
    input:focus, select:focus {
      border-color: #8b5cf6;
    }
    button {
      width: 100%;
      background: linear-gradient(90deg, #7c3aed, #2563eb);
      color: #fff;
      border: none;
      padding: 14px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .result-card {
      display: none;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .copy-btn {
      width: auto;
      padding: 6px 12px;
      font-size: 13px;
      background: #1f2937;
      border: 1px solid #374151;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.6;
      color: #e5e7eb;
    }
    .error {
      color: #f87171;
      font-size: 14px;
      margin-top: 12px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">AI VIDEO STUDIO PRO</div>
      <h1>Генератор сценариев и идей</h1>
      <p class="subtitle">Создайте хук, раскадровку и текст озвучки за 5 секунд</p>
    </div>

    <div class="card">
      <label for="topic">Тема вашего видео</label>
      <input id="topic" type="text" placeholder="Например: 3 нейросети, которые экономят 2 часа в день" />

      <label for="format">Формат и длительность</label>
      <select id="format">
        <option value="Shorts / Reels / TikTok (15–30 секунд)">Shorts / Reels / TikTok (15–30 сек)</option>
        <option value="YouTube видео (3–5 минут)">YouTube видео (3–5 мин)</option>
        <option value="Рекламный креатив (15 секунд)">Рекламный креатив (15 сек)</option>
      </select>

      <button id="generateBtn" onclick="generateScript()">Сгенерировать сценарий</button>
      <div id="errorBox" class="error"></div>
    </div>

    <div id="resultCard" class="card result-card">
      <div class="result-header">
        <strong>Готовый сценарий</strong>
        <button class="copy-btn" onclick="copyText()">Копировать</button>
      </div>
      <pre id="resultText"></pre>
    </div>
  </div>

  <script>
    async function generateScript() {
      const topic = document.getElementById("topic").value.trim();
      const format = document.getElementById("format").value;
      const btn = document.getElementById("generateBtn");
      const errorBox = document.getElementById("errorBox");
      const resultCard = document.getElementById("resultCard");
      const resultText = document.getElementById("resultText");

      if (!topic) {
        errorBox.textContent = "Введите тему видео.";
        errorBox.style.display = "block";
        return;
      }

      errorBox.style.display = "none";
      btn.disabled = true;
      btn.textContent = "Генерация...";

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, format })
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.details || data.error || "Ошибка сервера");
        }

        resultText.textContent = data.script;
        resultCard.style.display = "block";
      } catch (err) {
        errorBox.textContent = "Ошибка: " + err.message;
        errorBox.style.display = "block";
      } finally {
        btn.disabled = false;
        btn.textContent = "Сгенерировать сценарий";
      }
    }

    function copyText() {
      const text = document.getElementById("resultText").textContent;
      navigator.clipboard.writeText(text);
      alert("Сценарий скопирован!");
    }
  </script>
</body>
</html>`;

app.get("/", (req, res) => {
  res.send(htmlPage);
});

app.post("/api/generate", async (req, res) => {
  try {
    const { topic, format } = req.body;
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `Ты профессиональный сценарист видео. Напиши готовый сценарий на русском языке для формата "${format}" по теме: "${topic}".
Структура ответа:
1. Цепляющий заголовок
2. Хук (первые 3 секунды)
3. Раскадровка по сценам (что в кадре + текст озвучки)
4. Призыв к действию в конце`,
    });

    res.json({ script: response.output_text });
  } catch (error) {
    res.status(500).json({
      error: "Ошибка запроса к OpenAI API",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
