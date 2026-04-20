import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ShellLayout, StudentSidebar } from "../../components/Layout.jsx";
import AppIcon from "../../components/AppIcon.jsx";
import { APPS } from "../../data.js";
import { useAppState } from "../../state.jsx";

export default function StudentMyApps() {
  const { installed, toggleInstall } = useAppState();
  const apps = APPS.filter((a) => installed.includes(a.id));

  return (
    <ShellLayout
      role="student"
      sidebar={<StudentSidebar />}
      breadcrumb={[
        { label: "Student Portal" },
        { label: "My Apps" },
      ]}
    >
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-semibold text-ink mb-1">My Apps</h1>
        <p className="text-sub text-sm mb-6">
          Apps installed on your ScholarStack account
        </p>

        {apps.length === 0 ? (
          <div className="card p-8 text-center text-sub">
            No apps installed yet.{" "}
            <Link to="/student/store" className="text-ink underline">
              Browse the App Store →
            </Link>
          </div>
        ) : (
          <div className="card divide-y divide-line">
            {apps.map((app) => (
              <div key={app.id} className="p-4 flex items-center gap-4">
                <AppIcon app={app} />
                <div className="flex-1">
                  <div className="font-medium text-ink">{app.name}</div>
                  <div className="text-xs text-sub">Last used 2 hours ago</div>
                </div>
                <Link
                  to={app.id === "deepreview" ? "/deepreview" : `/student/apps/${app.id}/chat`}
                  className="link-arrow"
                >
                  Open <ArrowRight size={14} />
                </Link>
                <button className="text-xs text-sub hover:text-ink">
                  Manage permissions
                </button>
                <button
                  onClick={() => toggleInstall(app.id)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Uninstall
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ShellLayout>
  );
}
