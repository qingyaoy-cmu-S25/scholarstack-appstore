import { Link } from "react-router-dom";
import { ShellLayout, AdminSidebar } from "../../components/Layout.jsx";
import { ArrowRight, Check, Clock, Circle, X } from "lucide-react";
import { REVIEW_QUEUE } from "../../data.js";

const STEP_ICON = {
  passed: { icon: Check, color: "text-emerald-600 bg-emerald-50" },
  failed: { icon: X, color: "text-rose-600 bg-rose-50" },
  pending: { icon: Clock, color: "text-blue-600 bg-blue-50" },
  not_started: { icon: Circle, color: "text-sub2 bg-gray-50" },
};

const STEP_LABEL = {
  passed: "Passed",
  failed: "Failed",
  pending: "Pending",
  not_started: "Not started",
};

export default function AdminReview() {
  return (
    <ShellLayout
      role="admin"
      sidebar={<AdminSidebar />}
      breadcrumb={[{ label: "Admin Portal" }, { label: "Review Queue" }]}
    >
      <div className="p-8 max-w-5xl">
        <h1 className="text-2xl font-semibold text-ink mb-1">Review Queue</h1>
        <p className="text-sub text-sm mb-6">
          Apps awaiting safety, policy, and evaluation review
        </p>

        <div className="space-y-4">
          {REVIEW_QUEUE.map((app) => (
            <div key={app.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-ink">{app.name}</h3>
                  <p className="text-xs text-sub mt-0.5">
                    {app.developer} · Submitted {app.submitted}
                  </p>
                </div>
                <Link to={`/admin/review/${app.id}`} className="link-arrow">
                  Review <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ProgressStep
                  n={1}
                  title="Automated Scan"
                  state={app.progress.auto}
                />
                <ProgressStep
                  n={2}
                  title="Human Review"
                  state={app.progress.human}
                />
                <ProgressStep n={3} title="Eval Suite" state={app.progress.eval} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ShellLayout>
  );
}

function ProgressStep({ n, title, state }) {
  const m = STEP_ICON[state];
  const Icon = m.icon;
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center ${m.color}`}
      >
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-sub">Step {n}</div>
        <div className="text-sm font-medium text-ink truncate">{title}</div>
        <div className="text-xs text-sub">{STEP_LABEL[state]}</div>
      </div>
    </div>
  );
}
