import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";

import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSE_DIR = path.join(__dirname, "src/data/course_material");
const LECTURE_DIR = path.join(__dirname, "src/data/lecture");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/pdfs", express.static(COURSE_DIR));
app.use("/lectures", express.static(LECTURE_DIR));

const upload = multer({ dest: path.join(__dirname, "tmp_uploads") });

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

// --- Scholar Files API ---

const BUILTIN_FILES = new Set([
  "7-ai-terms-agents-rag-asi.pdf",
  "agentic-ai-and-mcp.pdf",
  "ai-eng-ch1-intro-foundation-models.pdf",
  "ai-eng-ch10-architecture-and-feedback.pdf",
  "ai-eng-ch3-evaluation-methodology.pdf",
  "ai-eng-ch4-evaluate-ai-systems.pdf",
  "ai-eng-ch5-prompt-engineering.pdf",
  "ai-eng-ch6-rag-and-agents.pdf",
  "ai-eng-ch7-finetuning.pdf",
  "attention-in-transformers.pdf",
  "brief-history-of-language-models.pdf",
  "demystifying-evals-for-ai-agents.pdf",
  "intro-to-mcp.pdf",
  "intro-to-prompting.pdf",
  "understanding-gpt-and-transformers.pdf",
  "what-are-llm-benchmarks.pdf",
  "what-are-word-embeddings.pdf",
  "syllabus-ai-engineering-fundamentals.pdf",
  "quiz-week1-ai-engineering-fundamentals.pdf",
  "quiz-week2-prompt-engineering.pdf",
  "quiz-week3-rag.pdf",
  "quiz-week4-evaluations.pdf",
  "quiz-week5-mcp-ucp.pdf",
]);

app.get("/api/files", (req, res) => {
  const readings = fs.readdirSync(COURSE_DIR)
    .filter((f) => f.endsWith(".pdf"))
    .map((f) => {
      const stat = fs.statSync(path.join(COURSE_DIR, f));
      return {
        name: f,
        displayName: prettifyFilename(f),
        type: "reading",
        builtIn: BUILTIN_FILES.has(f),
        size: stat.size,
        modified: stat.mtime,
      };
    });

  const lectures = fs.readdirSync(LECTURE_DIR)
    .filter((f) => f.endsWith(".mp4"))
    .map((f) => {
      const stat = fs.statSync(path.join(LECTURE_DIR, f));
      const hasTranscript = fs.existsSync(
        path.join(LECTURE_DIR, f.replace(".mp4", ".json"))
      );
      return {
        name: f,
        displayName: prettifyFilename(f),
        type: "lecture",
        builtIn: true,
        size: stat.size,
        modified: stat.mtime,
        hasTranscript,
      };
    });

  res.json({ files: [...readings, ...lectures].sort((a, b) => a.displayName.localeCompare(b.displayName)) });
});

app.post("/api/files/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== ".pdf") {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Only PDF files supported" });
  }

  const safeName = req.file.originalname
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  const dest = path.join(COURSE_DIR, safeName);
  fs.renameSync(req.file.path, dest);

  res.json({ status: "uploaded", filename: safeName });

  // Embed in background — don't block the response
  setImmediate(async () => {
  try {
    const pdfText = await extractPdfText(dest);
    const chunks = chunkText(pdfText, safeName);
    if (chunks.length === 0) { console.log(`[files] No text extracted from ${safeName}, skipping embed`); return; }

    const texts = chunks.map((c) => c.text);
    const embRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    const vectors = chunks.map((c, i) => ({
      id: crypto.createHash("md5").update(`${safeName}:${c.chunkIndex}`).digest("hex"),
      values: embRes.data[i].embedding,
      metadata: {
        source_file: safeName,
        page: c.page,
        chunk_index: c.chunkIndex,
        text: c.text.slice(0, 1000),
      },
    }));

    for (let i = 0; i < vectors.length; i += 100) {
      await pineconeIndex.upsert(vectors.slice(i, i + 100));
    }
    console.log(`[files] Embedded ${safeName}: ${vectors.length} chunks`);
  } catch (err) {
    console.error(`[files] Embed error for ${safeName}:`, err.message);
  }
  });
});

app.delete("/api/files/:filename", async (req, res) => {
  if (BUILTIN_FILES.has(req.params.filename)) return res.status(403).json({ error: "Cannot delete course materials" });
  const filePath = path.join(COURSE_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  fs.unlinkSync(filePath);

  try {
    const results = await pineconeIndex.query({
      vector: new Array(1536).fill(0),
      topK: 10000,
      filter: { source_file: { $eq: req.params.filename } },
      includeMetadata: false,
    });
    if (results.matches.length > 0) {
      const ids = results.matches.map((m) => m.id);
      await pineconeIndex.deleteMany(ids);
      console.log(`[files] Deleted ${ids.length} vectors for ${req.params.filename}`);
    }
  } catch (err) {
    console.error(`[files] Pinecone delete error:`, err.message);
  }

  res.json({ status: "deleted" });
});

function extractPdfText(filePath) {
  return import("child_process").then(({ execSync }) => {
    const script = `
import pdfplumber, json, sys
pages = []
with pdfplumber.open(sys.argv[1]) as pdf:
    for i, p in enumerate(pdf.pages):
        t = p.extract_text()
        if t and t.strip():
            pages.append({"page": i+1, "text": t.strip()})
print(json.dumps(pages))
`;
    const result = execSync(`python3 -c '${script}' "${filePath}"`, {
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024,
    });
    return JSON.parse(result);
  });
}

function chunkText(pages, filename) {
  const allText = pages.map((p) => p.text).join("\n\n");
  const words = allText.split(/\s+/);
  const chunkSize = 350;
  const overlap = 40;
  const chunks = [];
  let i = 0;
  let chunkIndex = 0;

  while (i < words.length) {
    const end = Math.min(i + chunkSize, words.length);
    const text = words.slice(i, end).join(" ");

    let page = 1;
    let charCount = 0;
    const charPos = words.slice(0, i).join(" ").length;
    for (const p of pages) {
      charCount += p.text.length + 2;
      if (charPos < charCount) { page = p.page; break; }
    }

    chunks.push({ text, page, chunkIndex });
    chunkIndex++;
    i += chunkSize - overlap;
  }
  return chunks;
}

// --- WebSocket Relay ---

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
      msg.name === "schedule_meeting"
    ) {
      console.log("[relay] Meeting tool call:", msg.arguments);
      try {
        const args = JSON.parse(msg.arguments);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: "custom.schedule_meeting",
            ...args,
          }));
        }

        openaiWs.send(JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: msg.call_id,
            output: JSON.stringify({ status: "Google Calendar opened with meeting details" }),
          },
        }));
        openaiWs.send(JSON.stringify({ type: "response.create" }));
      } catch (err) {
        console.error("[relay] Meeting error:", err.message);
      }
    }

    if (
      msg.type === "response.function_call_arguments.done" &&
      msg.name === "compose_email"
    ) {
      console.log("[relay] Email tool call:", msg.arguments);
      try {
        const args = JSON.parse(msg.arguments);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: "custom.compose_email",
            to: args.to,
            subject: args.subject,
            body: args.body,
          }));
        }

        openaiWs.send(JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: msg.call_id,
            output: JSON.stringify({ status: "Email draft opened in user's email client" }),
          },
        }));
        openaiWs.send(JSON.stringify({ type: "response.create" }));
      } catch (err) {
        console.error("[relay] Email error:", err.message);
      }
    }

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
        {
          type: "function",
          name: "schedule_meeting",
          description:
            "Schedule a meeting by opening Google Calendar with pre-filled details. Use this when the student wants to set up a meeting, study session, or office hours with someone.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Meeting title",
              },
              attendee_email: {
                type: "string",
                description: "Email address of the person to meet with",
              },
              date: {
                type: "string",
                description: "Date in YYYYMMDD format (e.g., 20260422)",
              },
              start_time: {
                type: "string",
                description: "Start time in HHMM 24-hour format (e.g., 1430 for 2:30 PM)",
              },
              duration_minutes: {
                type: "number",
                description: "Duration in minutes (default 30)",
              },
            },
            required: ["title", "attendee_email"],
          },
        },
        {
          type: "function",
          name: "compose_email",
          description:
            "Compose an email and open it in the student's email client, pre-filled and ready to send. Use this when the student wants to send an email to the professor, TA, or a classmate. Always sign the email with the student's real name from the system prompt, never use placeholders like [Your Name].",
          parameters: {
            type: "object",
            properties: {
              to: {
                type: "string",
                description: "Recipient email address",
              },
              subject: {
                type: "string",
                description: "Email subject line",
              },
              body: {
                type: "string",
                description: "Email body text",
              },
            },
            required: ["to", "subject", "body"],
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
