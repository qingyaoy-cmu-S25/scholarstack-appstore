import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Store,
  LayoutGrid,
  Settings,
  ChevronDown,
  GraduationCap,
  Wrench,
  Lock,
  Settings as Gear,
  ListChecks,
  ClipboardList,
  Send,
  BarChart3,
} from "lucide-react";

const ROLE_META = {
  student: { icon: GraduationCap, label: "Student", path: "Student Portal" },
  developer: { icon: Wrench, label: "Developer", path: "Developer Portal" },
  admin: { icon: Lock, label: "Admin", path: "Admin Portal" },
};

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-ink font-semibold">
      <span className="text-xl leading-none">≋</span>
      <span className="text-base">ScholarStack</span>
    </Link>
  );
}

export function Navbar({ role, breadcrumb = [] }) {
  const meta = role ? ROLE_META[role] : null;
  const Icon = meta?.icon;
  return (
    <header className="h-14 bg-white border-b border-line flex items-center px-6 sticky top-0 z-20">
      <Logo />
      <nav className="flex items-center text-sm text-sub ml-4">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center">
            <span className="mx-2 text-sub2">›</span>
            {b.to ? (
              <Link to={b.to} className="hover:text-ink">{b.label}</Link>
            ) : (
              <span className="text-ink2">{b.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3">
        {meta && (
          <span className="pill flex items-center gap-1.5">
            <Icon size={12} />
            {meta.label}
          </span>
        )}
        <Link to="/" className="text-sm text-sub hover:text-ink">Switch Role</Link>
        <button className="text-sub hover:text-ink"><Gear size={16} /></button>
      </div>
    </header>
  );
}

function SidebarLink({ to, icon: Icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
          isActive
            ? "bg-gray-100 text-ink font-medium"
            : "text-sub hover:bg-gray-50 hover:text-ink"
        }`
      }
    >
      {Icon && <Icon size={16} />}
      <span>{children}</span>
    </NavLink>
  );
}

function SidebarSection({ title, children, defaultOpen = true }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-3 mb-1 text-xs font-semibold uppercase tracking-wide text-sub2">
        <span>{title}</span>
        <ChevronDown size={12} />
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function StudentSidebar() {
  return (
    <aside className="w-60 bg-white border-r border-line p-3 shrink-0">
      <SidebarSection title="My Courses">
        <SidebarLink to="#" icon={BookOpen}>AI Engineering Fundamentals</SidebarLink>
      </SidebarSection>
      <SidebarSection title="Apps">
        <SidebarLink to="/student/store" icon={Store}>App Store</SidebarLink>
        <SidebarLink to="/student/apps" icon={LayoutGrid}>My Apps</SidebarLink>
      </SidebarSection>
      <SidebarSection title="Account">
        <SidebarLink to="#" icon={Settings}>Settings</SidebarLink>
      </SidebarSection>
    </aside>
  );
}

export function DeveloperSidebar() {
  return (
    <aside className="w-60 bg-white border-r border-line p-3 shrink-0">
      <SidebarSection title="Developer">
        <SidebarLink to="/developer/dashboard" icon={BarChart3}>Dashboard</SidebarLink>
        <SidebarLink to="/developer/submit" icon={Send}>Submit App</SidebarLink>
        <SidebarLink to="/developer/apps" icon={LayoutGrid}>My Apps</SidebarLink>
      </SidebarSection>
      <SidebarSection title="Account">
        <SidebarLink to="#" icon={Settings}>Settings</SidebarLink>
      </SidebarSection>
    </aside>
  );
}

export function AdminSidebar() {
  return (
    <aside className="w-60 bg-white border-r border-line p-3 shrink-0">
      <SidebarSection title="Admin">
        <SidebarLink to="/admin/dashboard" icon={BarChart3}>Dashboard</SidebarLink>
        <SidebarLink to="/admin/review" icon={ClipboardList}>Review Queue</SidebarLink>
      </SidebarSection>
      <SidebarSection title="Account">
        <SidebarLink to="#" icon={Settings}>Settings</SidebarLink>
      </SidebarSection>
    </aside>
  );
}

export function ShellLayout({ role, sidebar, breadcrumb, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} breadcrumb={breadcrumb} />
      <div className="flex flex-1">
        {sidebar}
        <main className="flex-1 bg-bg overflow-auto">{children}</main>
      </div>
    </div>
  );
}
