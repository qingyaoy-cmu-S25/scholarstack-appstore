import { useState, useEffect } from "react";
import SharedSidebar from "./SharedSidebar.jsx";
import {
  MessageSquare,
  HelpCircle,
  Swords,
  MessagesSquare,
  Check,
} from "lucide-react";

const VOICES = [
  { id: "alloy", label: "Alloy", desc: "Neutral, balanced" },
  { id: "ash", label: "Ash", desc: "Warm, conversational" },
  { id: "ballad", label: "Ballad", desc: "Soft, gentle" },
  { id: "coral", label: "Coral", desc: "Clear, direct" },
  { id: "echo", label: "Echo", desc: "Deeper, calm" },
  { id: "sage", label: "Sage", desc: "Authoritative, steady" },
  { id: "shimmer", label: "Shimmer", desc: "Bright, energetic" },
  { id: "verse", label: "Verse", desc: "Expressive, dynamic" },
];

const MODES = [
  { id: "general", icon: MessageSquare, label: "General" },
  { id: "quiz", icon: HelpCircle, label: "Quiz Me" },
  { id: "debate", icon: Swords, label: "Debate" },
  { id: "discuss", icon: MessagesSquare, label: "Discussion" },
];

const SILENCE_OPTIONS = [
  { value: 800, label: "Short (0.8s)", desc: "Fast-paced conversation" },
  { value: 1200, label: "Medium (1.2s)", desc: "Default — balanced" },
  { value: 1800, label: "Long (1.8s)", desc: "More time to think" },
  { value: 2500, label: "Extra long (2.5s)", desc: "For slower speakers" },
];

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem("stackvoice_settings") || "{}");
  } catch {
    return {};
  }
}

function saveSettings(s) {
  localStorage.setItem("stackvoice_settings", JSON.stringify(s));
}

export function useStackVoiceSettings() {
  const [settings, setSettings] = useState(() => ({
    voice: "alloy",
    silenceDuration: 1200,
    defaultMode: "general",
    ...getSettings(),
  }));

  const update = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

  return [settings, update];
}

export default function SettingsPage() {
  const [settings, update] = useStackVoiceSettings();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  return (
    <div className="h-screen flex flex-col">
      <header className="h-12 border-b border-line bg-white flex items-center px-5 shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg leading-none">≋</span>
          <span className="font-semibold text-ink">ScholarStack</span>
          <span className="text-sub2 mx-1">›</span>
          <span className="text-sub">Student Portal</span>
          <span className="text-sub2 mx-1">›</span>
          <span className="text-ink2 font-medium">StackVoice</span>
          <span className="text-sub2 mx-1">›</span>
          <span className="text-ink2 font-medium">Settings</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SharedSidebar active="settings" />

        <div className="flex-1 overflow-auto bg-white">
          <div className="max-w-xl mx-auto px-6 py-8">
            <h1 className="text-xl font-semibold text-ink mb-1">Settings</h1>
            <p className="text-sub text-sm mb-8">Configure your StackVoice experience</p>

            <Section title="Voice" desc="Choose the AI assistant's voice">
              <div className="grid grid-cols-2 gap-2">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { update("voice", v.id); setSaved(true); }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-left transition text-sm ${
                      settings.voice === v.id
                        ? "border-ink bg-gray-50"
                        : "border-line hover:border-ink/30"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-ink">{v.label}</div>
                      <div className="text-xs text-sub">{v.desc}</div>
                    </div>
                    {settings.voice === v.id && <Check size={14} className="text-ink shrink-0" />}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Silence Detection" desc="How long to wait before deciding you've stopped speaking">
              <div className="space-y-2">
                {SILENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { update("silenceDuration", opt.value); setSaved(true); }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md border text-left transition text-sm ${
                      settings.silenceDuration === opt.value
                        ? "border-ink bg-gray-50"
                        : "border-line hover:border-ink/30"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-ink">{opt.label}</div>
                      <div className="text-xs text-sub">{opt.desc}</div>
                    </div>
                    {settings.silenceDuration === opt.value && <Check size={14} className="text-ink shrink-0" />}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Default Mode" desc="Which mode to highlight when starting a new session">
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { update("defaultMode", m.id); setSaved(true); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-left transition text-sm ${
                        settings.defaultMode === m.id
                          ? "border-ink bg-gray-50"
                          : "border-line hover:border-ink/30"
                      }`}
                    >
                      <Icon size={14} />
                      <span className="font-medium text-ink">{m.label}</span>
                      {settings.defaultMode === m.id && <Check size={14} className="text-ink shrink-0 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </Section>

            {saved && (
              <div className="fixed bottom-6 right-6 bg-ink text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2">
                <Check size={14} /> Settings saved
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-ink mb-0.5">{title}</h2>
      <p className="text-xs text-sub mb-3">{desc}</p>
      {children}
    </div>
  );
}
