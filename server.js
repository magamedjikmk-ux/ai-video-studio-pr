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
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    body {
      background: #0b0f19;
      color: #f3f4f6;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 20px 14px;
    }

    .container {
      width: 100%;
      max-width: 720px;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
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
      margin-bottom: 8px;
    }

    h1 {
      font-size: 26px;
      font-weight: 800;
      background: linear-gradient(90deg, #a78bfa, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }

    .subtitle {
      color: #9ca3af;
      font-size: 13px;
    }

    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      margin-bottom: 18px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #d1d5db;
      margin-bottom: 6px;
    }

    input[type="text"],
    select,
    textarea {
      width: 100%;
      background: #0b0f19;
      border: 1px solid #374151;
      color: #fff;
      padding: 11px 13px;
      border-radius: 10px;
      font-size: 14px;
      margin-bottom: 14px;
      outline: none;
    }

    textarea {
      min-height: 72px;
      resize: vertical;
    }

    input:focus,
    select:focus,
    textarea:focus {
      border-color: #8b5cf6;
    }

    .media-box {
      background: #0b0f19;
      border: 1px dashed #374151;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 14px;
    }

    .media-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .secondary-btn {
      width: auto;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 8px;
      color: #e5e7eb;
      cursor: pointer;
    }

    .preview-wrap {
      margin-top: 10px;
      display: none;
    }

    .preview-wrap img,
    .preview-wrap video {
      width: 100%;
      max-height: 240px;
      object-fit: contain;
      border-radius: 10px;
      background: #000;
    }

    .file-info {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 6px;
    }

    .main-btn {
      width: 100%;
      background: linear-gradient(90deg, #7c3aed, #2563eb);
      color: #fff;
      border: none;
      padding: 13px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }

    .main-btn:disabled {
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
      gap: 10px;
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
      font-size: 13px;
      margin-top: 10px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">AI VIDEO STUDIO PRO</div>
      <h1>Пакет сценария, сцен и промптов</h1>
      <p class="subtitle">Тайминги, раскадровка, озвучка, субтитры и промпты под генерацию сцен</p>
    </div>

    <div class="card">
      <label for="topic">Тема или идея видео (можно оставить пустым, если есть «авто-идея»)</label>
      <input
        id="topic"
        type="text"
        placeholder="Например: Оживить фото и сделать динамичный ролик (или оставьте пустым)"
      />

      <div class="grid-2">
        <div>
          <label for="duration">Продолжительность</label>
          <select id="duration">
            <option value="10–15 секунд">10–15 секунд</option>
            <option value="15–30 секунд" selected>15–30 секунд</option>
            <option value="30–60 секунд">30–60 секунд</option>
            <option value="1–3 минуты">1–3 минуты</option>
            <option value="3–5 минут и больше">3–5 минут и больше</option>
          </select>
        </div>

        <div>
          <label for="format">Формат</label>
          <select id="format">
            <option value="Shorts / Reels / TikTok">Shorts / Reels / TikTok</option>
            <option value="Фото -> Видео (анимация кадра)">Фото -> Видео</option>
            <option value="YouTube видео">YouTube видео</option>
            <option value="Рекламный ролик">Рекламный ролик</option>
          </select>
        </div>
      </div>

      <div class="media-box">
        <label>Исходное фото или видео (необязательно)</label>
        <input id="mediaInput" type="file" accept="image/*,video/*" style="display:none;" onchange="handleMedia(event)" />
        <div class="media-actions">
          <button type="button" class="secondary-btn" onclick="document.getElementById('mediaInput').click()">
            + Добавить фото / видео
          </button>
          <button type="button" class="secondary-btn" onclick="clearMedia()">Очистить</button>
        </div>
        <div id="fileInfo" class="file-info">Файл не выбран</div>
        <div id="previewWrap" class="preview-wrap">
          <img id="imgPreview" style="display:none;" alt="Предпросмотр фото" />
          <video id="vidPreview" controls style="display:none;"></video>
        </div>
      </div>

      <label for="notes">Стиль и пожелания по монтажу</label>
      <textarea
        id="notes"
        placeholder="Например: динамичный темп, зум, переходы, субтитры, энергичная озвучка"
      ></textarea>

      <button id="generateBtn" class="main-btn" onclick="generatePack()">Сгенерировать пакет для видео</button>
      <div id="errorBox" class="error"></div>
    </div>

    <div id="resultCard" class="card result-card">
      <div class="result-header">
        <strong>Готовый пакет для монтажа</strong>
        <button type="button" class="secondary-btn" onclick="copyText()">Копировать</button>
      </div>
      <pre id="resultText"></pre>
    </div>
  </div>

  <script>
    let selectedFile = null;

    function handleMedia(event) {
      const file = event.target.files[0];
      if (!file) return;
      selectedFile = file;

      const info = document.getElementById("fileInfo");
      const wrap = document.getElementById("previewWrap");
      const img = document.getElementById("imgPreview");
      const vid = document.getElementById("vidPreview");

      info.textContent = "Выбрано: " + file.name + " (" + (file.size / 1024 / 1024).toFixed(2) + " МБ)";
      wrap.style.display = "block";

      const url = URL.createObjectURL(file);
      if (file.type.startsWith("video/")) {
        img.style.display = "none";
        vid.style.display = "block";
        vid.src = url;
      } else {
        vid.style.display = "none";
        img.style.display = "block";
        img.src = url;
      }
    }

    function clearMedia() {
      selectedFile = null;
      document.getElementById("mediaInput").value = "";
      document.getElementById("fileInfo").textContent = "Файл не выбран";
      document.getElementById("previewWrap").style.display = "none";
      document.getElementById("imgPreview").src = "";
      document.getElementById("vidPreview").src = "";
    }

    async function generatePack() {
      const topicInput = document.getElementById("topic").value.trim();
      const duration = document.getElementById("duration").value;
      const format = document.getElementById("format").value;
      const notes = document.getElementById("notes").value.trim();
      const btn = document.getElementById("generateBtn");
      const errorBox = document.getElementById("errorBox");
      const resultCard = document.getElementById("resultCard");
      const resultText = document.getElementById("resultText");

      errorBox.style.display = "none";
      btn.disabled = true;
      btn.textContent = "Генерация пакета...";

      const effectiveTopic = topicInput
        ? topicInput
        : selectedFile
          ? "Придумай сильную идею ролика на основе прикреплённого медиафайла"
          : "Придумай сам трендовую, цепляющую идею короткого видео";

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: effectiveTopic,
            duration,
            format,
            notes,
            hasMedia: Boolean(selectedFile),
            mediaName: selectedFile ? selectedFile.name : null,
            mediaType: selectedFile ? selectedFile.type : null
          })
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
        btn.textContent = "Сгенерировать пакет для видео";
      }
    }

    function copyText() {
      const text = document.getElementById("resultText").textContent;
      navigator.clipboard.writeText(text);
      alert("Пакет скопирован!");
    }
  </script>
</body>
</html>`;

app.get("/", (req, res) => {
  res.send(htmlPage);
});

app.post("/api/generate", async (req, res) => {
  try {
    const { topic, duration, format, notes, hasMedia, mediaName, mediaType } = req.body;

    const prompt = [
      "Ты продакшн-режиссёр и сценарист коротких и длинных видео.",
      "Сформируй полный пакет для создания и монтажа видео на русском языке.",
      `Идея / тема: ${topic}`,
      `Формат: ${format || "Shorts / Reels / TikTok"}`,
      `Продолжительность: ${duration || "15–30 секунд"}`,
      hasMedia ? `Исходный файл: ${mediaName || "медиа"} (${mediaType || "файл"})` : "Исходный файл: нет",
      notes ? `Пожелания по стилю и монтажу: ${notes}` : "",
      "",
      "Структура ответа:",
      "1. Название и главная идея ролика",
      "2. Хук (первые 2–3 секунды)",
      "3. Раскадровка по сценам с точными таймингами под выбранную длительность (для каждой сцены укажи: время, что в кадре, промпт для генерации сцены на английском, текст озвучки)",
      "4. Единый текст озвучки целиком",
      "5. Блок субтитров (короткие строки по таймингам)",
      "6. Рекомендации по монтажу (склейки, темп, акценты, концовка/CTA)"
    ]
      .filter(Boolean)
      .join("\n");

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
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
  console.log("Server running on port " + PORT);
});
