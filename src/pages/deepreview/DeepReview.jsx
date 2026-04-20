import { useNavigate } from "react-router-dom";
import { ShellLayout, StudentSidebar } from "../../components/Layout.jsx";
import {
  BrainCircuit,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Mic,
} from "lucide-react";

const MODES = [
  {
    id: "quiz",
    icon: HelpCircle,
    title: "Quiz Me",
    desc: "Test your knowledge with targeted questions",
    color: "bg-violet-500",
    hint: "I'll ask you questions one at a time and give you feedback on your answers.",
  },
  {
    id: "lecture",
    icon: GraduationCap,
    title: "Explain a Topic",
    desc: "Get a clear, in-depth explanation you can interrupt",
    color: "bg-blue-500",
    hint: "Tell me a topic and I'll walk you through it. Jump in anytime with questions.",
  },
  {
    id: "tutor",
    icon: BrainCircuit,
    title: "Think It Through",
    desc: "I'll guide you with questions — no direct answers",
    color: "bg-emerald-500",
    hint: "Socratic style. I'll ask leading questions until you get there yourself.",
  },
  {
    id: "discussion",
    icon: MessageCircle,
    title: "Open Discussion",
    desc: "Explore ideas freely, I'll challenge your thinking",
    color: "bg-amber-500",
    hint: "Let's talk through a concept. I'll push back when your reasoning has gaps.",
  },
];

export default function DeepReview() {
  const navigate = useNavigate();

  return (
    <ShellLayout
      role="student"
      sidebar={<StudentSidebar />}
      breadcrumb={[
        { label: "Student Portal" },
        { label: "My Apps", to: "/student/apps" },
        { label: "DeepReview" },
      ]}
    >
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center">
              <Mic size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">DeepReview</h1>
              <p className="text-sub text-sm">
                Voice-powered study companion — pick how you want to learn
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => navigate(`/deepreview/session/${mode.id}`)}
                className="card card-hover p-5 text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${mode.color} text-white flex items-center justify-center`}
                  >
                    <Icon size={18} />
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-sub2 opacity-0 group-hover:opacity-100 transition mt-1"
                  />
                </div>
                <h3 className="font-semibold text-ink mb-1">{mode.title}</h3>
                <p className="text-xs text-sub leading-relaxed">{mode.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 card p-4 flex items-start gap-3">
          <Mic size={14} className="text-sub2 mt-0.5 shrink-0" />
          <p className="text-xs text-sub leading-relaxed">
            DeepReview uses voice conversation to help you study. You'll speak
            with an AI tutor in real time — just talk naturally. Make sure your
            microphone is enabled.
          </p>
        </div>
      </div>
    </ShellLayout>
  );
}
