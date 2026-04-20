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

  const openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  openaiWs.on("open", () => {
    console.log("[relay] connected to OpenAI Realtime API");

    openaiWs.send(
      JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions:
            "You are DeepReview, a friendly AI study companion for a college AI Engineering course. You speak in a conversational, encouraging tone. Keep responses concise — 2-3 sentences max. You are currently in a quick test session.",
          voice: "alloy",
          input_audio_transcription: { model: "whisper-1" },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
        },
      })
    );
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
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(data.toString());
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
