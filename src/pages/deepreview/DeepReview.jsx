import { useNavigate } from "react-router-dom";
import SharedSidebar from "./SharedSidebar.jsx";
import {
  MessageSquare,
  HelpCircle,
  Swords,
  MessagesSquare,
  ArrowRight,
  Mic,
} from "lucide-react";

const MODES = [
  {
    id: "general",
    icon: MessageSquare,
    title: "General",
    desc: "Ask anything about the course — content, logistics, syllabus, professor info",
    color: "bg-ink",
  },
  {
    id: "quiz",
    icon: HelpCircle,
    title: "Quiz Me",
    desc: "Test your knowledge — I'll ask questions and grade your answers",
    color: "bg-violet-500",
  },
  {
    id: "debate",
    icon: Swords,
    title: "Debate",
    desc: "I'll take the opposing side — defend your position with evidence",
    color: "bg-rose-500",
  },
  {
    id: "discuss",
    icon: MessagesSquare,
    title: "Discussion",
    desc: "Open conversation about any topic — I'll challenge your thinking",
    color: "bg-amber-500",
  },
];

export default function StackVoice() {
  const navigate = useNavigate();

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
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SharedSidebar active="session" />

        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="max-w-lg w-full px-6">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Mic size={24} className="text-sub" />
              </div>
              <h1 className="text-2xl font-semibold text-ink mb-2">StackVoice</h1>
              <p className="text-sub text-sm">Choose a session mode to get started</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => navigate(`/deepreview/session/${mode.id}`)}
                    className="card card-hover p-4 text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg ${mode.color} text-white flex items-center justify-center`}>
                        <Icon size={16} />
                      </div>
                      <ArrowRight size={12} className="text-sub2 opacity-0 group-hover:opacity-100 transition mt-1" />
                    </div>
                    <h3 className="text-sm font-semibold text-ink mb-0.5">{mode.title}</h3>
                    <p className="text-xs text-sub leading-relaxed">{mode.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
