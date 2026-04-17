import { useParams } from "react-router-dom";
import { ShellLayout, StudentSidebar } from "../../components/Layout.jsx";
import AppIcon from "../../components/AppIcon.jsx";
import { APPS, TRACE_STEPS } from "../../data.js";

export default function StudentChat() {
  const { appId } = useParams();
  const app = APPS.find((a) => a.id === appId) || APPS[1];

  return (
    <ShellLayout
      role="student"
      sidebar={<StudentSidebar />}
      breadcrumb={[
        { label: "Student Portal" },
        { label: "My Apps", to: "/student/apps" },
        { label: app.name },
      ]}
    >
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="flex-1 flex flex-col bg-white border-r border-line">
          <div className="px-6 py-4 border-b border-line flex items-center gap-3">
            <AppIcon app={app} size={32} />
            <div>
              <div className="font-semibold text-ink text-sm">{app.name}</div>
              <div className="text-xs text-sub">Active session</div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-5 max-w-3xl mx-auto w-full">
            <SystemMsg>
              {app.name} — I help you format citations in APA, MLA, or Chicago
              style. Share a URL, DOI, or describe your source and I'll format
              it for you.
            </SystemMsg>

            <UserBubble>How do I cite a website in APA format?</UserBubble>

            <AssistantBubble>
              Great question! In APA 7th edition, a basic website citation
              follows this structure:
              <pre className="bg-gray-50 border border-line rounded-md p-3 mt-2 text-xs font-mono text-ink2 overflow-x-auto">
{`Author, A. A. (Year, Month Day). Title of work.
  Site Name. URL`}
              </pre>
              If there's no individual author, you can use the site name in the
              author position. Want me to format a specific source for you?
            </AssistantBubble>

            <UserBubble>
              Can you format this for me? The URL is
              https://openai.com/research/gpt-4
            </UserBubble>

            <AssistantBubble>
              Here's that source formatted in APA 7th edition:
              <pre className="bg-gray-50 border border-line rounded-md p-3 mt-2 text-xs font-mono text-ink2 overflow-x-auto whitespace-pre-wrap">
{`OpenAI. (2023, March 14). GPT-4. OpenAI.
  https://openai.com/research/gpt-4`}
              </pre>
              Let me know if you'd like MLA or Chicago instead.
            </AssistantBubble>
          </div>

          <div className="border-t border-line p-4">
            <div className="max-w-3xl mx-auto">
              <input
                className="input"
                placeholder="Message Citation Wizard..."
              />
            </div>
          </div>
        </div>

        <aside className="w-96 bg-bg overflow-auto p-5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-ink2 uppercase tracking-wide">
              Request Trace
            </h3>
            <code className="text-xs text-sub font-mono">trace_a8f3c1</code>
          </div>

          <div className="card p-3 space-y-1 mb-4">
            {TRACE_STEPS.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 py-2 border-b border-line last:border-0"
              >
                <span className="text-base leading-none mt-0.5">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-sm font-semibold ${s.color}`}>
                      {s.name}
                    </span>
                    <span className="text-xs font-mono text-sub2">
                      {s.time}
                    </span>
                  </div>
                  <p className="text-xs text-sub leading-snug mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-4 space-y-2 text-xs">
            <Row label="Model">Claude Haiku (Tier 1)</Row>
            <Row label="Tokens">320 in / 85 out</Row>
            <Row label="Cost">~$0.0004</Row>
            <Row label="Knowledge">APA Style Guide, 7th Ed.</Row>
          </div>
        </aside>
      </div>
    </ShellLayout>
  );
}

function SystemMsg({ children }) {
  return (
    <div className="text-xs text-sub text-center bg-gray-50 border border-line rounded-md px-4 py-2 max-w-2xl mx-auto">
      {children}
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div className="flex justify-end">
      <div className="bg-gray-100 text-ink2 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-lg text-sm">
        {children}
      </div>
    </div>
  );
}

function AssistantBubble({ children }) {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-line text-ink2 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between">
      <span className="text-sub">{label}</span>
      <span className="text-ink2 font-medium">{children}</span>
    </div>
  );
}
