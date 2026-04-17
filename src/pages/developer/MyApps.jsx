import { ShellLayout, DeveloperSidebar } from "../../components/Layout.jsx";
import { CheckCircle2, Search, XCircle, ArrowRight } from "lucide-react";
import { DEV_APPS } from "../../data.js";

const STATUS_META = {
  published: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    label: "Published",
    cta: "View Dashboard",
  },
  review: {
    icon: Search,
    color: "text-blue-600",
    label: "In Review",
    cta: "View Status",
  },
  rejected: {
    icon: XCircle,
    color: "text-rose-600",
    label: "Rejected",
    cta: "Edit & Resubmit",
  },
};

export default function DeveloperApps() {
  return (
    <ShellLayout
      role="developer"
      sidebar={<DeveloperSidebar />}
      breadcrumb={[
        { label: "Developer Portal" },
        { label: "My Apps" },
      ]}
    >
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-semibold text-ink mb-1">My Apps</h1>
        <p className="text-sub text-sm mb-6">Manage your published and in-review apps</p>

        <div className="card divide-y divide-line">
          {DEV_APPS.map((app) => {
            const m = STATUS_META[app.status];
            const Icon = m.icon;
            return (
              <div key={app.id} className="p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="font-medium text-ink">{app.name}</div>
                  <div className={`flex items-center gap-1.5 text-xs mt-1 ${m.color}`}>
                    <Icon size={12} />
                    {m.label}
                    {app.installs && <span className="text-sub"> · {app.installs} installs</span>}
                    {app.step && <span className="text-sub"> · {app.step}</span>}
                  </div>
                  {app.reason && (
                    <div className="text-xs text-sub mt-1.5 max-w-xl">
                      <span className="font-medium text-rose-600">Reason:</span> {app.reason}
                    </div>
                  )}
                </div>
                <button className="link-arrow shrink-0">
                  {m.cta} <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ShellLayout>
  );
}
