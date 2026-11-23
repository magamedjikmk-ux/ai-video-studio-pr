const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });

  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

  res.end(
    JSON.stringify({
      status: "ok",
      project: "AI VIDEO STUDIO PRO",
      openai_key_connected: hasApiKey,
    })
  );
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
