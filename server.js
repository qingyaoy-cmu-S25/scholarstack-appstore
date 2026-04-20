import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_REALTIME_URL =
  "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17";

wss.on("connection", (clientWs) => {
  console.log("[relay] client connected");

  let openaiReady = false;
  const pendingMessages = [];

  const openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  openaiWs.on("open", () => {
    console.log("[relay] connected to OpenAI Realtime API");
    openaiReady = true;

    for (const msg of pendingMessages) {
      openaiWs.send(msg);
    }
    pendingMessages.length = 0;
  });

  openaiWs.on("message", (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data.toString());
    }
  });

  openaiWs.on("error", (err) => {
    console.error("[relay] OpenAI error:", err.message);
    clientWs.close();
  });

  openaiWs.on("close", (code, reason) => {
    console.log("[relay] OpenAI closed:", code, reason.toString());
    clientWs.close();
  });

  clientWs.on("message", (data) => {
    const msg = data.toString();
    if (openaiReady) {
      openaiWs.send(msg);
    } else {
      pendingMessages.push(msg);
    }
  });

  clientWs.on("close", () => {
    console.log("[relay] client disconnected");
    openaiWs.close();
  });
});

const PORT = 8081;
server.listen(PORT, () => {
  console.log(`[relay] server running on http://localhost:${PORT}`);
});
