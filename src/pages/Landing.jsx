import { Link } from "react-router-dom";
import { GraduationCap, Wrench, Lock, ArrowRight } from "lucide-react";

const ROLES = [
  {
    to: "/student/store",
    icon: GraduationCap,
    title: "Student",
    desc: "Browse and install academic AI apps",
  },
  {
    to: "/developer/dashboard",
    icon: Wrench,
    title: "Developer",
    desc: "Build, submit, and monitor your apps",
  },
  {
    to: "/admin/dashboard",
    icon: Lock,
    title: "Admin",
    desc: "Review submissions and monitor platform health",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="h-14 bg-white border-b border-line flex items-center px-6">
        <div className="flex items-center gap-2 text-ink font-semibold">
          <span className="text-xl leading-none">≋</span>
          <span>ScholarStack</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-ink tracking-tight mb-3">
              ScholarStack App Store
            </h1>
            <p className="text-sub text-base">
              Select your role to explore the platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.title}
                  to={r.to}
                  className="card card-hover p-6 group"
                >
                  <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center mb-4">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-ink mb-1">
                    {r.title}
                  </h3>
                  <p className="text-sm text-sub mb-6 leading-relaxed">{r.desc}</p>
                  <span className="link-arrow">
                    Continue <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>

          <p className="text-center text-xs text-sub2 mt-12">
            Demo prototype · All data is mocked
          </p>
        </div>
      </main>
    </div>
  );
}
