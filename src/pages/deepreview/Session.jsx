import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStackVoiceSettings } from "./SettingsPage.jsx";
import SharedSidebar from "./SharedSidebar.jsx";
import {
  Mic,
  Phone,
  PhoneOff,
  BookOpen,
  MessageSquare,
  Settings,
  BarChart3,
  History,
  CheckCircle2,
  RotateCw,
  FileText,
  Video,
  X,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  Swords,
  MessagesSquare,
} from "lucide-react";

function fmtTimestamp(seconds) {
  if (!seconds && seconds !== 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const COURSE_INFO = `

COURSE QUICK REFERENCE (from syllabus):
- Course: AI Engineering Fundamentals (49-762)
- Instructor: David Miller (dhmiller@andrew.cmu.edu)
- TA: Shreya Nigam (shreyani@andrew.cmu.edu)
- Class time: Wednesdays 3:30 - 5:20 PM
- Location: SV 118 (in person) or Zoom
- Office Hours: by appointment (email the instructor)
- Teammate: Ifrah Aijaz (iaijaz@andrew.cmu.edu)
- Current student: Jackey Yu (qingyaoy@andrew.cmu.edu)`;

const RAG_INSTRUCTION = `\n\nIMPORTANT: You have access to a tool called "search_course_materials" that searches the student's actual course readings, lecture transcripts, syllabus, and quizzes. Use it whenever the student asks about a course topic so your answers are grounded in real course content. When citing results, mention the source naturally (e.g., "According to the chapter on RAG and agents, page 12..." or "In Lecture 3 at around 15 minutes..."). Always prefer course material over your general knowledge.${COURSE_INFO}`;

const MODE_CONFIG = {
  general: {
    icon: MessageSquare,
    title: "General",
    color: "bg-ink",
    prompt: `You are StackVoice, a voice-based AI assistant for the course "AI Engineering Fundamentals." You help students with anything course-related: content questions, logistics, syllabus details, assignments, professor contact info, deadlines, grading policies — anything that might be in the course materials.

Be helpful, friendly, and concise — 2-3 sentences max since this is a spoken conversation. Start by greeting the student and asking how you can help.` + RAG_INSTRUCTION,
  },
  quiz: {
    icon: HelpCircle,
    title: "Quiz Me",
    color: "bg-violet-500",
    prompt: `You are StackVoice in Quiz Mode — a voice-based AI study companion for "AI Engineering Fundamentals."

Rules:
- Ask the student ONE question at a time about AI engineering concepts
- Wait for their verbal answer before continuing
- Tell them clearly if they're right or wrong and briefly explain why
- Then ask the next question, gradually increasing difficulty
- Mix question types: definitions, comparisons, applications, "what would happen if..."
- If they get something wrong, explain the correct answer before moving on
- Track patterns and mention them: "You're strong on transformers but shaky on embeddings"
- Keep responses SHORT — 2-3 sentences max. This is spoken, not written.
- Start by asking what topics they want to be quizzed on, or offer to quiz them on everything.` + RAG_INSTRUCTION,
  },
  debate: {
    icon: Swords,
    title: "Debate",
    color: "bg-rose-500",
    prompt: `You are StackVoice in Debate Mode — a voice-based AI study companion for "AI Engineering Fundamentals."

Rules:
- The student will state a position on an AI engineering topic
- You ALWAYS take the opposing side, even if you agree with them
- Challenge their arguments: demand evidence, point out logical gaps, raise counterexamples
- If they make a good point, acknowledge it but pivot to a new angle of attack
- Use course materials to support your counterarguments
- Stay respectful but firm — this is intellectual sparring, not a fight
- Keep responses to 2-3 sentences. Make one sharp point at a time.
- Start by asking the student to pick a topic and state their position, or suggest a debate topic like "Is fine-tuning worth the cost vs prompt engineering?" or "Should AI models be open-source?"` + RAG_INSTRUCTION,
  },
  discuss: {
    icon: MessagesSquare,
    title: "Discussion",
    color: "bg-amber-500",
    prompt: `You are StackVoice in Discussion Mode — a voice-based AI study companion for "AI Engineering Fundamentals."

Rules:
- Have a natural, open-ended conversation about AI engineering topics
- The student may share opinions, ask speculative questions, or explore ideas
- Engage genuinely — agree when they make good points, push back when they don't
- Challenge weak reasoning: "That's interesting, but have you considered..."
- Connect ideas across topics when relevant: "That relates to what we discussed about RAG..."
- Ask follow-up questions to deepen the conversation
- This should feel like talking with a smart study partner, not a teacher
- Keep responses conversational — 2-3 sentences. Match their energy.
- Start by asking what's on their mind or suggest an interesting topic from the course.` + RAG_INSTRUCTION,
  },
};

function fmtClock(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function fmtDate(date) {
  return (
    date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }) +
    ", " +
    fmtClock(date)
  );
}

export default function Session() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const config = MODE_CONFIG[mode] || MODE_CONFIG.general;
  const ModeIcon = config.icon;
  const [settings] = useStackVoiceSettings();

  const [phase, setPhase] = useState("mic-prompt");
  const [status, setStatus] = useState("idle");
  const [entries, setEntries] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [previewSource, setPreviewSource] = useState(null);
  const pendingRagRef = useRef(null);
  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const nextPlayTimeRef = useRef(0);
  const activeSourcesRef = useRef([]);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  const allowMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPhase("ready");
    } catch {
      setPhase("mic-denied");
    }
  }, []);

  const stopAllAudio = useCallback(() => {
    activeSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    activeSourcesRef.current = [];
    if (audioCtxRef.current) {
      nextPlayTimeRef.current = audioCtxRef.current.currentTime;
    }
  }, []);

  const playAudioChunk = useCallback((base64) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const raw = atob(base64);
    const pcm16 = new Int16Array(raw.length / 2);
    for (let i = 0; i < pcm16.length; i++) {
      pcm16[i] = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8);
    }
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const now = ctx.currentTime;
    const startAt = Math.max(now, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(
        (s) => s !== source,
      );
    };
  }, []);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setEntries([]);
    const now = new Date();
    setStartTime(now);
    setElapsed(0);
    setPhase("session");

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 24000,
    });
    audioCtxRef.current = audioCtx;
    nextPlayTimeRef.current = 0;

    const ws = new WebSocket("ws://localhost:8081/ws");
    wsRef.current = ws;

    ws.onopen = async () => {
      setStatus("connected");

      ws.send(
        JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: config.prompt,
            voice: settings.voice,
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: settings.silenceDuration,
            },
          },
        }),
      );

      setEntries([
        { type: "event", text: "Started conversation", time: new Date() },
      ]);

      // Trigger assistant to speak first
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
          },
        }),
      );

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 24000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        streamRef.current = stream;

        const inputCtx = new AudioContext({ sampleRate: 24000 });
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = { processor, inputCtx };

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const float32 = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
          }
          const bytes = new Uint8Array(int16.buffer);
          let binary = "";
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          ws.send(
            JSON.stringify({
              type: "input_audio_buffer.append",
              audio: btoa(binary),
            }),
          );
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
        setStatus("active");
        timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      } catch (err) {
        console.error("Mic error:", err);
        setStatus("error");
      }
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      switch (msg.type) {
        case "input_audio_buffer.speech_started":
          stopAllAudio();
          setAiSpeaking(false);
          break;

        case "input_audio_buffer.committed":
          setEntries((prev) => [
            ...prev,
            {
              type: "message",
              role: "user",
              text: "",
              time: new Date(),
              itemId: msg.item_id,
            },
          ]);
          break;

        case "custom.rag_results":
          pendingRagRef.current = msg.results;
          break;

        case "custom.compose_email": {
          const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(msg.to)}&su=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
          window.open(gmailUrl, "_blank");
          break;
        }

        case "custom.schedule_meeting": {
          const date = msg.date || new Date().toISOString().slice(0, 10).replace(/-/g, "");
          const startTime = msg.start_time || "1400";
          const duration = msg.duration_minutes || 30;
          const endH = Math.floor((parseInt(startTime.slice(0, 2)) * 60 + parseInt(startTime.slice(2)) + duration) / 60);
          const endM = (parseInt(startTime.slice(0, 2)) * 60 + parseInt(startTime.slice(2)) + duration) % 60;
          const endTime = `${String(endH).padStart(2, "0")}${String(endM).padStart(2, "0")}`;
          const start = `${date}T${startTime}00`;
          const end = `${date}T${endTime}00`;
          const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(msg.title)}&dates=${start}/${end}&add=${encodeURIComponent(msg.attendee_email)}`;
          window.open(calUrl, "_blank");
          break;
        }

        case "response.created":
          setAiSpeaking(true);
          {
            const sources = pendingRagRef.current;
            pendingRagRef.current = null;
            setEntries((prev) => [
              ...prev,
              { type: "message", role: "assistant", text: "", time: new Date(), _pendingSources: sources || null, sources: null },
            ]);
          }
          break;

        case "response.audio.delta":
          playAudioChunk(msg.delta);
          break;

        case "response.audio_transcript.delta":
          setEntries((prev) => {
            const idx = prev.findLastIndex(
              (e) => e.role === "assistant" && e.type === "message",
            );
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              text: updated[idx].text + msg.delta,
            };
            return updated;
          });
          break;

        case "conversation.item.input_audio_transcription.completed": {
          const text = msg.transcript?.trim();
          if (!text) break;
          setEntries((prev) => {
            const idx = prev.findLastIndex(
              (e) =>
                e.type === "message" &&
                e.role === "user" &&
                e.itemId === msg.item_id,
            );
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], text };
              return updated;
            }
            const fallbackIdx = prev.findLastIndex(
              (e) => e.type === "message" && e.role === "user" && !e.text,
            );
            if (fallbackIdx !== -1) {
              const updated = [...prev];
              updated[fallbackIdx] = { ...updated[fallbackIdx], text };
              return updated;
            }
            return prev;
          });
          break;
        }

        case "response.done":
          setAiSpeaking(false);
          setEntries((prev) => {
            const updated = [...prev];
            const idx = updated.findLastIndex((e) => e.type === "message" && e.role === "assistant");
            if (idx !== -1 && updated[idx]._pendingSources) {
              updated[idx] = { ...updated[idx], sources: updated[idx]._pendingSources, _pendingSources: undefined };
            }
            return [...updated, { type: "event", text: "Assistant turn ended", time: new Date() }];
          });
          break;

        case "error":
          console.error("OpenAI error:", msg.error);
          break;
      }
    };

    ws.onerror = () => setStatus("error");
    ws.onclose = () => {
      setStatus("idle");
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playAudioChunk, stopAllAudio]);

  const disconnect = useCallback(() => {
    stopAllAudio();
    if (timerRef.current) clearInterval(timerRef.current);
    if (wsRef.current) wsRef.current.close();
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());
    if (processorRef.current) {
      processorRef.current.processor.disconnect();
      processorRef.current.inputCtx.close();
    }
    if (audioCtxRef.current) audioCtxRef.current.close();
    setEntries((prev) => [
      ...prev,
      { type: "event", text: "Conversation ended", time: new Date() },
    ]);
    setStatus("idle");
  }, [stopAllAudio]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wsRef.current) wsRef.current.close();
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (processorRef.current) {
        processorRef.current.processor.disconnect();
        processorRef.current.inputCtx.close();
      }
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const fmtElapsed = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="h-screen flex flex-col">
      <header className="h-12 border-b border-line bg-white flex items-center px-5 justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg leading-none">≋</span>
          <button onClick={() => navigate("/deepreview")} className="hover:opacity-70 transition">
            <ArrowLeft size={15} className="text-sub" />
          </button>
          <span className="font-semibold text-ink">StackVoice</span>
          <span className="text-sub2 mx-1">›</span>
          <div className={`w-5 h-5 rounded ${config.color} text-white flex items-center justify-center`}>
            <ModeIcon size={11} />
          </div>
          <span className="text-ink2 font-medium">{config.title}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-sub">
          {status === "active" && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono">{fmtElapsed(elapsed)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SharedSidebar active="session" />

        <div className="flex-1 flex flex-col bg-white">
          {/* Session header */}
          {phase === "session" && (
            <div className="px-6 py-3 border-b border-line">
              <div className="text-sm font-medium text-ink">
                {startTime ? fmtDate(startTime) : "New Session"}
              </div>
              <div className="text-xs text-sub mt-0.5">
                {status === "active" ? "Session in progress" : "Session ended"}
              </div>
            </div>
          )}

          {/* Main area */}
          <div ref={scrollRef} className="flex-1 overflow-auto px-6 py-4">
            {/* Mic prompt */}
            {phase === "mic-prompt" && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                  <Mic size={26} className="text-sub" />
                </div>
                <h2 className="text-lg font-semibold text-ink mb-2">
                  Microphone access is required
                </h2>
                <p className="text-sub text-sm mb-5 max-w-xs">
                  Please enable microphone permissions to start the call.
                </p>
                <button onClick={allowMic} className="btn-primary">
                  Allow access
                </button>
              </div>
            )}

            {phase === "mic-denied" && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-5">
                  <Mic size={26} className="text-rose-400" />
                </div>
                <h2 className="text-lg font-semibold text-ink mb-2">
                  Microphone access denied
                </h2>
                <p className="text-sub text-sm mb-5 max-w-xs">
                  Please allow microphone access in your browser settings, then
                  try again.
                </p>
                <button
                  onClick={() => setPhase("mic-prompt")}
                  className="btn-outline gap-2"
                >
                  <RotateCw size={14} /> Try again
                </button>
              </div>
            )}

            {/* Ready to start */}
            {phase === "ready" && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
                  <CheckCircle2 size={26} className="text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold text-ink mb-2">
                  Ready to start
                </h2>
                <p className="text-sub text-sm mb-5 max-w-xs">
                  Microphone access granted. Click "Start call" to begin your
                  session with StackVoice.
                </p>
              </div>
            )}

            {/* Chat log */}
            {phase === "session" && (
              <div className="max-w-3xl mx-auto">
                {entries.map((entry, i) => {
                  if (entry.type === "event") {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-2 my-1"
                      >
                        <div className="flex-1 h-px bg-line" />
                        <span className="text-xs text-sub px-2">
                          {entry.text}
                        </span>
                        <span className="text-xs text-sub2">
                          {fmtClock(entry.time)}
                        </span>
                        <div className="flex-1 h-px bg-line" />
                      </div>
                    );
                  }

                  if (entry.type === "message" && !entry.text) {
                    if (entry.role === "user") {
                      return (
                        <div key={i} className="flex justify-end my-3">
                          <div className="max-w-lg flex flex-col items-end">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-blue-600">
                                User
                              </span>
                              <span className="text-xs text-sub2">
                                {fmtClock(entry.time)}
                              </span>
                            </div>
                            <div className="rounded-2xl px-4 py-3 text-sm bg-gray-100 text-sub rounded-tr-sm italic">
                              transcribing...
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }

                  const isUser = entry.role === "user";
                  return (
                    <div
                      key={i}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} my-3`}
                    >
                      <div
                        className={`max-w-lg ${isUser ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-semibold ${isUser ? "text-blue-600" : "text-ink"}`}
                          >
                            {isUser ? "User" : "Assistant"}
                          </span>
                          <span className="text-xs text-sub2">
                            {fmtClock(entry.time)}
                          </span>
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            isUser
                              ? "bg-gray-100 text-ink rounded-tr-sm"
                              : "bg-white border border-line text-ink2 rounded-tl-sm shadow-sm"
                          }`}
                        >
                          {entry.text}
                        </div>
                        {entry.sources && entry.sources.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {entry.sources.slice(0, 4).map((src, j) => {
                              const isLecture = src.type === "lecture";
                              const Icon = isLecture ? Video : FileText;
                              const label = isLecture
                                ? `${src.source} · ${fmtTimestamp(src.startTime)}`
                                : `${src.source}, p. ${src.page}`;
                              return (
                                <button
                                  key={j}
                                  onClick={() => setPreviewSource(src)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 border border-line text-xs text-sub hover:border-ink/30 hover:text-ink transition"
                                >
                                  <Icon size={11} />
                                  <span>{label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Source preview modal */}
            {previewSource && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreviewSource(null)}>
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-line shrink-0">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-ink truncate">{previewSource.source}</h3>
                      <p className="text-xs text-sub mt-0.5">
                        {previewSource.type === "lecture"
                          ? `Timestamp: ${fmtTimestamp(previewSource.startTime)}`
                          : `Page ${previewSource.page}`}
                      </p>
                    </div>
                    <button onClick={() => setPreviewSource(null)} className="text-sub hover:text-ink ml-4 shrink-0">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1">
                    {previewSource.type === "lecture" ? (
                      <video
                        src={`http://localhost:8081/lectures/${encodeURIComponent(previewSource.filename)}#t=${Math.floor(previewSource.startTime)}`}
                        controls
                        autoPlay
                        className="w-full h-full rounded-b-lg bg-black"
                      />
                    ) : (
                      <iframe
                        src={`http://localhost:8081/pdfs/${encodeURIComponent(previewSource.filename)}#page=${previewSource.page}`}
                        className="w-full h-full border-0 rounded-b-lg"
                        title={previewSource.source}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-line px-6 py-4 shrink-0">
            <div className="flex items-center justify-center">
              {phase === "mic-prompt" || phase === "mic-denied" ? (
                <div />
              ) : status === "idle" || status === "error" ? (
                <button onClick={connect} className="btn-primary gap-2">
                  <Phone size={15} /> Start call
                </button>
              ) : status === "connecting" ? (
                <button disabled className="btn-primary gap-2 opacity-50">
                  Connecting...
                </button>
              ) : (
                <div className="flex items-center gap-5">
                  {!aiSpeaking && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                      <Mic size={14} className="animate-pulse" />
                      Listening — speak naturally
                    </div>
                  )}
                  {aiSpeaking && (
                    <span className="text-xs text-sub">
                      Assistant is speaking...
                    </span>
                  )}
                  <button
                    onClick={disconnect}
                    className="btn-outline gap-2 text-sm !text-rose-600 !border-rose-200 hover:!bg-rose-50"
                  >
                    <PhoneOff size={14} /> End call
                  </button>
                </div>
              )}
              {status === "error" && (
                <p className="text-rose-500 text-xs ml-4">
                  Connection failed. Is the relay server running?
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
