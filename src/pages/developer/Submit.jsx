import { useState } from "react";
import { ShellLayout, DeveloperSidebar } from "../../components/Layout.jsx";
import { Check, AlertTriangle } from "lucide-react";

const STEP_LABELS = ["Basic Info", "Tool Schema", "Permissions & Model", "Review & Submit"];

const SAMPLE_SCHEMA = `{
  "name": "format_citation",
  "description": "Format a source into a citation in the specified style",
  "parameters": {
    "source_url": { "type": "string" },
    "style": { "type": "string", "enum": ["APA", "MLA", "Chicago"] }
  }
}`;

const SCOPES = [
  { key: "read:courses", sensitive: false },
  { key: "read:scholar_files", sensitive: false },
  { key: "write:annotations", sensitive: false },
  { key: "read:grades", sensitive: true },
  { key: "write:submissions", sensitive: true },
];

export default function DeveloperSubmit() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "Citation Wizard Pro",
    desc: "Auto-format citations from URLs and DOIs in APA, MLA, or Chicago.",
    category: "Citation",
    courses: ["AI Engineering Fundamentals"],
    schema: SAMPLE_SCHEMA,
    scopes: ["read:courses", "read:scholar_files"],
    tier: 1,
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleScope = (s) =>
    setForm((p) => ({
      ...p,
      scopes: p.scopes.includes(s)
        ? p.scopes.filter((x) => x !== s)
        : [...p.scopes, s],
    }));

  const hasSensitive = form.scopes.some((s) => SCOPES.find((x) => x.key === s)?.sensitive);

  return (
    <ShellLayout
      role="developer"
      sidebar={<DeveloperSidebar />}
      breadcrumb={[
        { label: "Developer Portal" },
        { label: "Submit App" },
      ]}
    >
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-semibold text-ink mb-1">Submit App</h1>
        <p className="text-sub text-sm mb-6">
          Submit a new app to the ScholarStack App Store
        </p>

        {!submitted && (
          <div className="flex items-center gap-2 mb-8">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                        ? "bg-ink text-white"
                        : "bg-gray-100 text-sub"
                    }`}
                  >
                    {done ? <Check size={12} /> : n}
                  </div>
                  <span
                    className={`text-xs ${
                      active ? "text-ink font-medium" : "text-sub"
                    }`}
                  >
                    {label}
                  </span>
                  {n < STEP_LABELS.length && (
                    <span className="w-6 h-px bg-line" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {submitted ? (
          <SubmitSuccess />
        ) : (
          <div className="card p-6">
            {step === 1 && (
              <div className="space-y-4">
                <Field label="App name">
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    className="input min-h-24"
                    value={form.desc}
                    onChange={(e) => update("desc", e.target.value)}
                  />
                </Field>
                <Field label="Category">
                  <select
                    className="input"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                  >
                    {["Writing", "Math & Science", "Research", "Citation", "Code", "Language"].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      )
                    )}
                  </select>
                </Field>
                <Field label="Target courses">
                  <div className="flex flex-wrap gap-2">
                    {form.courses.map((c) => (
                      <span key={c} className="pill">{c} ×</span>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="label">Define your app's tools (OpenAPI JSON Schema)</label>
                <textarea
                  className="w-full font-mono text-xs bg-gray-50 border border-line rounded-md p-3 min-h-64 text-ink2 focus:outline-none focus:border-ink/40"
                  value={form.schema}
                  onChange={(e) => update("schema", e.target.value)}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="label">Permission scopes</label>
                  <div className="space-y-2">
                    {SCOPES.map((s) => (
                      <label
                        key={s.key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={form.scopes.includes(s.key)}
                          onChange={() => toggleScope(s.key)}
                        />
                        <code className="font-mono text-xs">{s.key}</code>
                        {s.sensitive && (
                          <span className="text-xs text-amber-600">sensitive</span>
                        )}
                      </label>
                    ))}
                  </div>
                  {hasSensitive && (
                    <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md p-3">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        Sensitive scope selected — triggers additional human review.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Model tier preference</label>
                  <div className="space-y-2">
                    {[
                      { n: 1, label: "Tier 1 — Lightweight (~$0.001/1K)" },
                      { n: 2, label: "Tier 2 — Mid-Range (~$0.01/1K)" },
                      { n: 3, label: "Tier 3 — Frontier (~$0.06/1K)" },
                    ].map((t) => (
                      <label key={t.n} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="tier"
                          checked={form.tier === t.n}
                          onChange={() => update("tier", t.n)}
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 text-sm">
                <Summary label="Name" value={form.name} />
                <Summary label="Description" value={form.desc} />
                <Summary label="Category" value={form.category} />
                <Summary label="Scopes" value={form.scopes.join(", ")} />
                <Summary label="Model Tier" value={`Tier ${form.tier}`} />
                <div>
                  <div className="text-xs text-sub mb-1">Tool schema</div>
                  <pre className="text-xs font-mono bg-gray-50 border border-line rounded-md p-3 overflow-x-auto">{form.schema}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="btn-outline disabled:opacity-40"
              >
                ← Back
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="btn-primary"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(true)}
                  className="btn-primary"
                >
                  Submit for Review
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </ShellLayout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-line">
      <span className="text-sub text-xs uppercase tracking-wide">{label}</span>
      <span className="text-ink2 text-right max-w-md">{value}</span>
    </div>
  );
}

function SubmitSuccess() {
  return (
    <div className="card p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
        <Check size={22} />
      </div>
      <h2 className="text-lg font-semibold text-ink mb-2">
        App Submitted Successfully!
      </h2>
      <p className="text-sub text-sm mb-6">
        Your app will go through our 3-step review:
      </p>
      <div className="text-left max-w-md mx-auto space-y-3 mb-6">
        <ReviewStep n={1} title="Automated Safety Scan" desc="System prompt, scopes, tool declarations" />
        <ReviewStep n={2} title="Human Policy Review" desc="Educational intent, FERPA compliance" />
        <ReviewStep n={3} title="Evaluation Test Suite" desc="Red-team prompts, edge cases" />
      </div>
      <p className="text-xs text-sub">Estimated review time: 2–3 business days</p>
    </div>
  );
}

function ReviewStep({ n, title, desc }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-6 h-6 rounded-full bg-gray-100 text-ink2 text-xs font-semibold flex items-center justify-center shrink-0">
        {n}
      </div>
      <div>
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-sub">{desc}</div>
      </div>
    </div>
  );
}
