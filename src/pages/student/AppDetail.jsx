import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, Lock, ArrowRight } from "lucide-react";
import { ShellLayout, StudentSidebar } from "../../components/Layout.jsx";
import AppIcon from "../../components/AppIcon.jsx";
import { APPS, PERMISSIONS, APP_REVIEWS, LONG_DESC } from "../../data.js";
import { useAppState } from "../../state.jsx";

const TIER_LABELS = {
  1: "Tier 1 — Lightweight",
  2: "Tier 2 — Mid-Range",
  3: "Tier 3 — Frontier",
};

export default function StudentAppDetail() {
  const { appId } = useParams();
  const app = APPS.find((a) => a.id === appId);
  const { installed, toggleInstall } = useAppState();
  const navigate = useNavigate();
  if (!app) return null;
  const isInstalled = installed.includes(app.id);
  const perms = PERMISSIONS[app.id] || PERMISSIONS.default;
  const reviews = APP_REVIEWS[app.id] || APP_REVIEWS["citation-wizard"];
  const longDesc = LONG_DESC[app.id] || `${app.desc}.`;

  return (
    <ShellLayout
      role="student"
      sidebar={<StudentSidebar />}
      breadcrumb={[
        { label: "Student Portal" },
        { label: "App Store", to: "/student/store" },
        { label: app.name },
      ]}
    >
      <div className="p-8 grid lg:grid-cols-3 gap-8 max-w-6xl">
        <div className="lg:col-span-2">
          <div className="flex items-start gap-4 mb-4">
            <AppIcon app={app} size={56} />
            <div>
              <h1 className="text-2xl font-semibold text-ink">{app.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-sub">
                <span className="pill">{app.category}</span>
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {app.rating} · {app.users} users
                </span>
              </div>
            </div>
          </div>

          <p className="text-sub leading-relaxed mb-8">{longDesc}</p>

          <h2 className="text-sm font-semibold text-ink2 uppercase tracking-wide mb-3">
            Preview
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <AppPreview app={app} variant={1} />
            <AppPreview app={app} variant={2} />
          </div>

          <h2 className="text-sm font-semibold text-ink2 uppercase tracking-wide mb-3">
            User Reviews
          </h2>
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-ink text-sm">{r.user}</span>
                  <div className="flex items-center">
                    {Array.from({ length: r.stars }).map((_, j) => (
                      <Star
                        key={j}
                        size={12}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-sub">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <button
              onClick={() => {
                if (!isInstalled) toggleInstall(app.id);
                navigate(app.id === "stackvoice" ? "/deepreview" : `/student/apps/${app.id}/chat`);
              }}
              className="btn-primary w-full mb-4"
            >
              {isInstalled ? "Open App" : "Install App"}
              <ArrowRight size={14} />
            </button>
            {isInstalled && (
              <button
                onClick={() => toggleInstall(app.id)}
                className="text-xs text-sub hover:text-rose-600 mb-4 block w-full text-center"
              >
                Uninstall
              </button>
            )}

            <h3 className="text-xs font-semibold text-ink2 uppercase tracking-wide mb-2">
              Permissions Requested
            </h3>
            <div className="space-y-2 mb-5">
              {perms.map((p) => (
                <div key={p.scope} className="flex gap-2">
                  <Lock size={12} className="text-sub2 mt-0.5 shrink-0" />
                  <div>
                    <code className="text-xs text-ink2 font-mono">
                      {p.scope}
                    </code>
                    <p className="text-xs text-sub leading-snug">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-sub bg-gray-50 border border-line rounded-md p-3 mb-5">
              <span className="font-medium text-ink2">Scholar Files:</span> This
              app only accesses files you explicitly grant. Revoke anytime.
            </div>

            <dl className="space-y-2 text-xs">
              <Row label="Model Tier">
                <span className="pill">{TIER_LABELS[app.tier]}</span>
              </Row>
              <Row label="Developer">{app.developer}</Row>
              <Row label="Last updated">{app.updated}</Row>
              <Row label="Version">{app.version}</Row>
            </dl>
          </div>
        </aside>
      </div>
    </ShellLayout>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-sub">{label}</dt>
      <dd className="text-ink2 font-medium">{children}</dd>
    </div>
  );
}

function PreviewFrame({ title, children }) {
  return (
    <div className="aspect-video bg-white border border-line rounded-md overflow-hidden shadow-sm flex flex-col">
      <div className="h-5 bg-gray-50 border-b border-line flex items-center gap-1 px-2 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-[9px] text-sub2 font-medium truncate">
          {title}
        </span>
      </div>
      <div className="flex-1 p-2.5 text-[9px] leading-tight overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function AppPreview({ app, variant }) {
  const previews = PREVIEWS[app.id] || PREVIEWS.default;
  return previews[variant - 1];
}

const PREVIEWS = {
  "stackvoice": [
    <PreviewFrame key="1" title="StackVoice · Voice session">
      <div className="space-y-1">
        <div className="text-sub text-[8px] mb-0.5">Assistant</div>
        <div className="border border-line rounded px-1.5 py-1 text-ink2">
          What do you understand about attention mechanisms?
        </div>
        <div className="text-sub text-[8px] mb-0.5 text-right">User</div>
        <div className="bg-gray-100 rounded px-1.5 py-1 text-ink2 text-right">
          It's like... the model decides which parts of the input matter most?
        </div>
        <div className="text-sub text-[8px] mb-0.5">Assistant</div>
        <div className="border border-line rounded px-1.5 py-1 text-ink2">
          Good start. But how does it "decide"? What's the mechanism?
        </div>
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="StackVoice · Transcript">
      <div className="space-y-0.5">
        {[
          { t: "Attention mechanisms", d: "Apr 17" },
          { t: "Transformer architecture", d: "Apr 15" },
          { t: "Embeddings & tokenization", d: "Apr 12" },
          { t: "RAG pipelines", d: "Apr 10" },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between border-b border-line pb-0.5">
            <span className="text-ink2 font-medium">{s.t}</span>
            <span className="text-sub">{s.d}</span>
          </div>
        ))}
      </div>
    </PreviewFrame>,
  ],
  "writing-coach": [
    <PreviewFrame key="1" title="Writing Coach · Essay feedback">
      <div className="text-ink2 mb-1">
        The <span className="bg-amber-100 px-0.5">rise of AI</span> has changed education in many ways. Students now use AI tools <span className="bg-rose-100 px-0.5">constantly</span> for homework...
      </div>
      <div className="border-t border-line pt-1 mt-1 space-y-0.5">
        <div className="text-amber-700">⚠ Thesis is vague — what's your claim?</div>
        <div className="text-rose-700">⚠ "Constantly" — can you quantify?</div>
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Writing Coach · Structure">
      <div className="space-y-0.5">
        <div className="flex justify-between"><span className="text-ink2 font-medium">Thesis clarity</span><span className="text-amber-700">Weak</span></div>
        <div className="flex justify-between"><span className="text-ink2 font-medium">Evidence</span><span className="text-emerald-700">Strong</span></div>
        <div className="flex justify-between"><span className="text-ink2 font-medium">Argument flow</span><span className="text-amber-700">Moderate</span></div>
        <div className="flex justify-between"><span className="text-ink2 font-medium">Conclusion tie-back</span><span className="text-rose-700">Missing</span></div>
        <div className="flex justify-between"><span className="text-ink2 font-medium">Cohesion</span><span className="text-emerald-700">Strong</span></div>
      </div>
    </PreviewFrame>,
  ],
  "latex-formatter": [
    <PreviewFrame key="1" title="LaTeX Formatter · Input">
      <div className="text-sub mb-0.5">You typed</div>
      <div className="border border-line rounded px-1.5 py-1 text-ink2 mb-1">
        integral from 0 to pi of sin(x) dx
      </div>
      <div className="text-sub mb-0.5">LaTeX</div>
      <div className="bg-gray-50 border border-line rounded px-1.5 py-1 font-mono text-[8px] text-ink2">
        \int_0^\pi \sin(x)\,dx
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="LaTeX Formatter · Preview">
      <div className="text-sub mb-0.5">Rendered</div>
      <div className="bg-gray-50 border border-line rounded p-2 text-center text-ink2 font-serif italic text-[11px]">
        ∫₀<sup>π</sup> sin(x) dx = 2
      </div>
      <div className="flex gap-1 mt-1">
        <span className="px-1 py-0.5 rounded bg-ink text-white text-[8px]">Copy</span>
        <span className="px-1 py-0.5 rounded bg-gray-100 text-ink2 text-[8px]">Overleaf</span>
      </div>
    </PreviewFrame>,
  ],
  "research-synth": [
    <PreviewFrame key="1" title="Research Synthesizer · Matrix">
      <div className="grid grid-cols-4 gap-0.5 text-[8px]">
        <div></div>
        <div className="text-center text-sub">Paper A</div>
        <div className="text-center text-sub">Paper B</div>
        <div className="text-center text-sub">Paper C</div>
        <div className="text-ink2 font-medium">Claim 1</div>
        <div className="text-center text-emerald-600">✓</div>
        <div className="text-center text-emerald-600">✓</div>
        <div className="text-center text-rose-600">✗</div>
        <div className="text-ink2 font-medium">Claim 2</div>
        <div className="text-center text-emerald-600">✓</div>
        <div className="text-center text-sub2">—</div>
        <div className="text-center text-emerald-600">✓</div>
        <div className="text-ink2 font-medium">Method</div>
        <div className="text-center text-sub">RCT</div>
        <div className="text-center text-sub">Obs.</div>
        <div className="text-center text-sub">Meta</div>
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Research Synthesizer · Themes">
      <div className="space-y-0.5">
        <div className="text-ink2 font-medium">Key themes</div>
        <div className="pill">causality</div>
        <div className="pill">sample bias</div>
        <div className="pill">replication</div>
        <div className="text-ink2 font-medium pt-1">Gaps</div>
        <div className="text-sub leading-snug">• Longitudinal data missing in all 3 sources</div>
        <div className="text-sub leading-snug">• No cross-cultural comparison</div>
      </div>
    </PreviewFrame>,
  ],
  "code-explainer": [
    <PreviewFrame key="1" title="Code Explainer · Walkthrough">
      <pre className="font-mono text-[8px] text-ink2 bg-gray-50 border border-line rounded p-1 leading-tight">
{`def fib(n):
  if n < 2: return n
  return fib(n-1) + fib(n-2)`}
      </pre>
      <div className="mt-1 space-y-0.5 text-sub">
        <div><span className="text-ink2 font-medium">L1</span> — defines recursive function</div>
        <div><span className="text-ink2 font-medium">L2</span> — base case stops recursion</div>
        <div><span className="text-ink2 font-medium">L3</span> — sum of previous two</div>
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Code Explainer · Concepts">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-ink2 font-medium">Recursion</span>
          <span className="pill">Week 4</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink2 font-medium">Base cases</span>
          <span className="pill">Week 4</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink2 font-medium">Memoization</span>
          <span className="pill">Week 6</span>
        </div>
        <div className="text-sub leading-snug pt-1">
          Your syllabus covers memoization in two weeks — worth revisiting then.
        </div>
      </div>
    </PreviewFrame>,
  ],
  "peer-review": [
    <PreviewFrame key="1" title="Peer Review Helper · Rubric">
      <div className="space-y-1">
        {[
          { t: "Clarity", v: 4 },
          { t: "Evidence", v: 3 },
          { t: "Argumentation", v: 5 },
          { t: "Style", v: 4 },
        ].map((x) => (
          <div key={x.t} className="flex items-center justify-between">
            <span className="text-ink2 font-medium">{x.t}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`w-1.5 h-1.5 rounded-full ${n <= x.v ? "bg-ink" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Peer Review Helper · Comments">
      <div className="space-y-1">
        <div className="bg-emerald-50 border border-emerald-200 rounded px-1.5 py-1 text-ink2">
          <span className="text-emerald-700 font-medium">+</span> Strong topic sentence in ¶2
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded px-1.5 py-1 text-ink2">
          <span className="text-amber-700 font-medium">→</span> Consider adding evidence for claim in ¶3
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded px-1.5 py-1 text-ink2">
          <span className="text-rose-700 font-medium">!</span> Conclusion doesn't tie back to thesis
        </div>
      </div>
    </PreviewFrame>,
  ],
  "flashcard-gen": [
    <PreviewFrame key="1" title="Flashcard Generator · Card">
      <div className="h-full flex flex-col">
        <div className="text-sub text-[8px] mb-1">Card 12 of 80 · Biology Ch.4</div>
        <div className="flex-1 border border-line rounded p-2 flex items-center justify-center text-center text-ink2 font-medium">
          The process by which plants convert light energy into chemical energy is called ______.
        </div>
        <div className="flex gap-1 mt-1 justify-center">
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[8px]">Again</span>
          <span className="px-1.5 py-0.5 rounded bg-ink text-white text-[8px]">Good</span>
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[8px]">Easy</span>
        </div>
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Flashcard Generator · Deck">
      <div className="space-y-0.5">
        {[
          { t: "Photosynthesis", c: 18 },
          { t: "Cellular respiration", c: 22 },
          { t: "ATP & ADP cycle", c: 14 },
          { t: "Light reactions", c: 16 },
          { t: "Calvin cycle", c: 10 },
        ].map((d) => (
          <div key={d.t} className="flex items-center justify-between border-b border-line pb-0.5">
            <span className="text-ink2">{d.t}</span>
            <span className="text-sub">{d.c} cards</span>
          </div>
        ))}
      </div>
    </PreviewFrame>,
  ],
  "grammar-style": [
    <PreviewFrame key="1" title="Grammar & Style · Review">
      <div className="text-ink2 leading-snug">
        The <span className="bg-amber-100 px-0.5">utilization</span> of machine learning <span className="bg-rose-100 px-0.5">was performed</span> on the dataset.
      </div>
      <div className="border-t border-line pt-1 mt-1 space-y-0.5">
        <div className="text-amber-700">⚠ "Utilization" → "use" (nominalization)</div>
        <div className="text-rose-700">⚠ Passive voice — consider active form</div>
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Grammar & Style · Score">
      <div className="space-y-1">
        <div>
          <div className="flex justify-between"><span className="text-ink2 font-medium">Readability</span><span className="text-ink">82</span></div>
          <div className="h-1 bg-gray-100 rounded"><div className="h-1 bg-emerald-500 rounded" style={{ width: "82%" }} /></div>
        </div>
        <div>
          <div className="flex justify-between"><span className="text-ink2 font-medium">Formality</span><span className="text-ink">71</span></div>
          <div className="h-1 bg-gray-100 rounded"><div className="h-1 bg-ink rounded" style={{ width: "71%" }} /></div>
        </div>
        <div>
          <div className="flex justify-between"><span className="text-ink2 font-medium">Passive voice</span><span className="text-amber-700">18%</span></div>
          <div className="h-1 bg-gray-100 rounded"><div className="h-1 bg-amber-500 rounded" style={{ width: "18%" }} /></div>
        </div>
      </div>
    </PreviewFrame>,
  ],
  "stats-viz": [
    <PreviewFrame key="1" title="Statistics Visualizer · Chart">
      <div className="text-sub mb-1">Recommended: Box plot</div>
      <div className="h-10 flex items-end justify-around">
        {[6, 8, 5, 9, 7].map((h, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-2 bg-blue1" style={{ height: h * 3 }} />
            <div className="w-0.5 h-1 bg-ink" />
          </div>
        ))}
      </div>
      <div className="text-sub leading-snug mt-1">Best for comparing distributions across groups.</div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Statistics Visualizer · Code">
      <pre className="font-mono text-[8px] text-ink2 bg-gray-50 border border-line rounded p-1 leading-tight">
{`library(ggplot2)
ggplot(data, aes(x=group,
  y=score, fill=group)) +
  geom_boxplot() +
  theme_minimal()`}
      </pre>
      <div className="flex gap-1 mt-1">
        <span className="px-1 py-0.5 rounded bg-ink text-white text-[8px]">R</span>
        <span className="px-1 py-0.5 rounded bg-gray-100 text-ink2 text-[8px]">Python</span>
      </div>
    </PreviewFrame>,
  ],
  "citation-wizard": [
    <PreviewFrame key="1" title="Citation Wizard · New citation">
      <div className="text-[9px] text-sub mb-1">Source URL</div>
      <div className="border border-line rounded px-1.5 py-1 text-ink2 font-mono text-[8px] truncate mb-1.5">
        https://openai.com/research/gpt-4
      </div>
      <div className="flex gap-1 mb-1.5">
        <span className="px-1.5 py-0.5 rounded bg-ink text-white text-[8px]">APA</span>
        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-ink2 text-[8px]">MLA</span>
        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-ink2 text-[8px]">Chicago</span>
      </div>
      <div className="bg-gray-50 border border-line rounded p-1.5 font-mono text-[8px] text-ink2 leading-snug">
        OpenAI. (2023, March 14). GPT-4. OpenAI. https://openai.com/research/gpt-4
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Citation Wizard · Library">
      <div className="space-y-1">
        {[
          { t: "GPT-4 Technical Report", y: "2023", s: "APA" },
          { t: "Attention Is All You Need", y: "2017", s: "APA" },
          { t: "The Elements of Style", y: "1918", s: "MLA" },
          { t: "A Brief History of Time", y: "1988", s: "Chicago" },
        ].map((c, i) => (
          <div key={i} className="flex items-center justify-between border-b border-line pb-0.5">
            <div className="truncate text-ink2 font-medium">{c.t}</div>
            <div className="flex gap-1 shrink-0 ml-1">
              <span className="text-sub">{c.y}</span>
              <span className="px-1 rounded bg-gray-100 text-ink2">{c.s}</span>
            </div>
          </div>
        ))}
      </div>
    </PreviewFrame>,
  ],
  "socratic-math": [
    <PreviewFrame key="1" title="Socratic Math Tutor · Session">
      <div className="space-y-1">
        <div className="bg-gray-100 text-ink2 rounded px-1.5 py-1 inline-block">
          Solve 2x + 6 = 14
        </div>
        <div className="bg-white border border-line rounded px-1.5 py-1 text-ink2">
          What's the first step to isolate x?
        </div>
        <div className="bg-gray-100 text-ink2 rounded px-1.5 py-1 inline-block">
          Subtract 6 from both sides?
        </div>
        <div className="bg-white border border-line rounded px-1.5 py-1 text-ink2">
          Great — try it and tell me what you get.
        </div>
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="Socratic Math Tutor · Progress">
      <div className="text-ink2 font-semibold mb-1">Topics mastered</div>
      {[
        { t: "Linear equations", p: 92 },
        { t: "Quadratics", p: 74 },
        { t: "Systems of eq.", p: 58 },
      ].map((x, i) => (
        <div key={i} className="mb-1">
          <div className="flex justify-between text-sub"><span>{x.t}</span><span>{x.p}%</span></div>
          <div className="h-1 bg-gray-100 rounded">
            <div className="h-1 bg-ink rounded" style={{ width: `${x.p}%` }} />
          </div>
        </div>
      ))}
    </PreviewFrame>,
  ],
  default: [
    <PreviewFrame key="1" title="App preview">
      <div className="space-y-1">
        <div className="h-2 bg-gray-100 rounded w-3/4" />
        <div className="h-2 bg-gray-100 rounded w-1/2" />
        <div className="h-2 bg-gray-100 rounded w-5/6" />
        <div className="h-2 bg-gray-100 rounded w-2/3" />
      </div>
    </PreviewFrame>,
    <PreviewFrame key="2" title="App preview">
      <div className="grid grid-cols-2 gap-1">
        <div className="h-6 bg-gray-100 rounded" />
        <div className="h-6 bg-gray-100 rounded" />
        <div className="h-6 bg-gray-100 rounded" />
        <div className="h-6 bg-gray-100 rounded" />
      </div>
    </PreviewFrame>,
  ],
};
