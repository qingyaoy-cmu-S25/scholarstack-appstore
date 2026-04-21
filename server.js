import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use("/pdfs", express.static(path.join(__dirname, "src/data/course_material")));
app.use("/lectures", express.static(path.join(__dirname, "src/data/lecture")));
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_REALTIME_URL =
  "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME || "deepreview");

function fmtTimestamp(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function prettifyFilename(filename) {
  return filename
    .replace(/\.pdf$/, "")
    .replace(/^ai-eng-ch(\d+)-/, "AI Engineering Ch$1: ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function searchCourseMaterials(query) {
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const vector = embeddingRes.data[0].embedding;

  const results = await pineconeIndex.query({
    vector,
    topK: 15,
    includeMetadata: true,
  });

  const readings = [];
  const lectures = [];
  for (const m of results.matches) {
    if (m.metadata.source_type === "lecture") {
      if (lectures.length < 2) lectures.push(m);
    } else {
      if (readings.length < 3) readings.push(m);
    }
  }

  const all = [...readings, ...lectures];
  all.sort((a, b) => b.score - a.score);

  return all.map((m) => {
    const isLecture = m.metadata.source_type === "lecture";
    return {
      source: prettifyFilename(m.metadata.source_file),
      filename: m.metadata.source_file,
      type: isLecture ? "lecture" : "reading",
      page: m.metadata.page || null,
      startTime: m.metadata.start_time || null,
      startTimeFormatted: m.metadata.start_time ? fmtTimestamp(m.metadata.start_time) : null,
      endTime: m.metadata.end_time || null,
      score: Math.round(m.score * 100) / 100,
      text: m.metadata.text,
    };
  });
}

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

  openaiWs.on("message", async (data) => {
    const msgStr = data.toString();
    const msg = JSON.parse(msgStr);

    if (
      msg.type === "response.function_call_arguments.done" &&
      msg.name === "search_course_materials"
    ) {
      console.log("[relay] RAG tool call:", msg.arguments);
      try {
        const args = JSON.parse(msg.arguments);
        const results = await searchCourseMaterials(args.query);
        console.log(
          "[relay] RAG results:",
          results.map((r) => `${r.source} p${r.page} (${r.score})`).join(", ")
        );

        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({
              type: "custom.rag_results",
              results: results.map((r) => ({
                source: r.source,
                filename: r.filename,
                type: r.type,
                page: r.page,
                startTime: r.startTime,
                score: r.score,
                text: r.text,
              })),
            })
          );
        }

        const toolResponse = JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: msg.call_id,
            output: JSON.stringify(results),
          },
        });
        openaiWs.send(toolResponse);

        openaiWs.send(
          JSON.stringify({
            type: "response.create",
          })
        );
      } catch (err) {
        console.error("[relay] RAG error:", err.message);
        openaiWs.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: msg.call_id,
              output: JSON.stringify({ error: "Search failed" }),
            },
          })
        );
        openaiWs.send(JSON.stringify({ type: "response.create" }));
      }
    }

    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(msgStr);
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

    const parsed = JSON.parse(msg);
    if (parsed.type === "session.update" && parsed.session) {
      parsed.session.tools = [
        {
          type: "function",
          name: "search_course_materials",
          description:
            "Search the student's course materials (textbooks, lecture notes, readings) for relevant content. Use this whenever the student asks about a course topic, concept, or when you need to ground your answer in the actual course content.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "The search query describing what to look for in course materials",
              },
            },
            required: ["query"],
          },
        },
      ];
      const modified = JSON.stringify(parsed);
      if (openaiReady) {
        openaiWs.send(modified);
      } else {
        pendingMessages.push(modified);
      }
      return;
    }

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
