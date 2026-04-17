import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star } from "lucide-react";
import { ShellLayout, StudentSidebar } from "../../components/Layout.jsx";
import AppIcon from "../../components/AppIcon.jsx";
import { APPS, CATEGORIES } from "../../data.js";
import { useAppState } from "../../state.jsx";

export default function StudentStore() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const { installed } = useAppState();

  const filtered = useMemo(() => {
    return APPS.filter((a) => {
      const matchesCat = cat === "All" || a.category === cat;
      const matchesQ =
        !q ||
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.desc.toLowerCase().includes(q.toLowerCase()) ||
        a.category.toLowerCase().includes(q.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [q, cat]);

  return (
    <ShellLayout
      role="student"
      sidebar={<StudentSidebar />}
      breadcrumb={[
        { label: "Student Portal" },
        { label: "App Store" },
      ]}
    >
      <div className="p-8 max-w-6xl">
        <h1 className="text-2xl font-semibold text-ink">App Store</h1>
        <p className="text-sub text-sm mt-1 mb-6">
          AI-powered tools for your courses
        </p>

        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sub"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search apps by name, course, or category..."
            className="input pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                cat === c
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink2 border-line hover:border-ink/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => {
            const isInstalled = installed.includes(app.id);
            return (
              <Link
                key={app.id}
                to={`/student/store/${app.id}`}
                className="card card-hover p-4 flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <AppIcon app={app} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink truncate">{app.name}</h3>
                    <p className="text-xs text-sub line-clamp-2 mt-0.5">
                      {app.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-sub">
                    <span className="pill">{app.category}</span>
                    <span className="flex items-center gap-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      {app.rating}
                    </span>
                    <span>· {app.users}</span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isInstalled ? "text-emerald-600" : "text-ink"
                    }`}
                  >
                    {isInstalled ? "Installed ✓" : "Install"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ShellLayout>
  );
}
