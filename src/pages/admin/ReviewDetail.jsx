import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShellLayout, AdminSidebar } from "../../components/Layout.jsx";
import { X, Check } from "lucide-react";
import { REVIEW_QUEUE } from "../../data.js";
import Toast from "../../components/Toast.jsx";

export default function AdminReviewDetail() {
  const { appId } = useParams();
  const app = REVIEW_QUEUE.find((a) => a.id === appId) || REVIEW_QUEUE[0];
  const [toast, setToast] = useState(false);
  const [decision, setDecision] = useState(null);

  return (
    <ShellLayout
      role="admin"
      sidebar={<AdminSidebar />}
      breadcrumb={[
        { label: "Admin Portal" },
        { label: "Review Queue", to: "/admin/review" },
        { label: app.name },
      ]}
    >
      <div className="p-8 max-w-6xl grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{app.name}</h1>
            <p className="text-sub text-sm">
              {app.developer} · Submitted {app.submitted}
            </p>
          </div>

          <Section title="System Prompt">
            <pre className="bg-gray-50 border border-line rounded-md p-4 text-xs font-mono text-ink2 whitespace-pre-wrap">
              {app.systemPrompt}
            </pre>
          </Section>

          <Section title="Tool Declarations">
            <pre className="bg-gray-50 border border-line rounded-md p-4 text-xs font-mono text-ink2 overflow-x-auto">
              {app.toolSchema}
            </pre>
          </Section>

          {app.evalResults && (
            <Section title="Eval Results">
              <div className="card p-4">
                <div className="text-sm font-medium text-ink mb-2">
                  {app.evalResults.passed}/{app.evalResults.total} test cases passed
                </div>
                <div className="space-y-2">
                  {app.evalResults.failures.map((f) => (
                    <div
                      key={f.case}
                      className="flex items-start gap-2 text-xs"
                    >
                      <X size={12} className="text-rose-600 mt-0.5 shrink-0" />
                      <div>
                        <code className="font-mono text-rose-600">{f.case}</code>
                        <p className="text-sub mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}
        </div>

        <aside>
          <div className="card p-5 sticky top-20 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-ink2 uppercase tracking-wide mb-2">
                Requested Scopes
              </h3>
              <div className="space-y-1.5">
                {app.scopes.map((s) => {
                  const sensitive = app.sensitive.includes(s);
                  return (
                    <div
                      key={s}
                      className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                        sensitive
                          ? "bg-amber-50 border border-amber-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <code className="font-mono text-ink2">{s}</code>
                      {sensitive && (
                        <span className="text-amber-700 font-medium">
                          sensitive
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <dl className="text-xs space-y-2">
              <Row label="Model Tier">Tier {app.tier}</Row>
              <Row label="Developer">{app.developer}</Row>
              <Row label="Submitted">{app.submitted}</Row>
            </dl>

            {decision ? (
              <div
                className={`text-sm font-medium text-center py-2 rounded-md ${
                  decision === "approved"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {decision === "approved" ? "✓ Approved" : "⟲ Returned for changes"}
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-line">
                <button
                  onClick={() => {
                    setDecision("approved");
                    setToast(true);
                  }}
                  className="btn-primary w-full"
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  onClick={() => {
                    setDecision("returned");
                    setToast(true);
                  }}
                  className="btn-outline w-full"
                >
                  Return for Changes
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <Toast show={toast} onClose={() => setToast(false)}>
        Decision recorded — developer notified
      </Toast>
    </ShellLayout>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink2 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between">
      <dt className="text-sub">{label}</dt>
      <dd className="text-ink2 font-medium">{children}</dd>
    </div>
  );
}
