import { useNavigate } from "react-router-dom";
import {
  Mic,
  BookOpen,
  Settings,
  BarChart3,
  History,
} from "lucide-react";

export default function SharedSidebar({ active }) {
  return (
    <aside className="w-56 border-r border-line bg-white flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-line">
        <div className="flex items-center gap-2 text-ink font-semibold">
          <span className="text-lg leading-none">≋</span>
          <span className="text-sm">StackVoice</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        <SidebarItem icon={Mic} to="/deepreview" active={active === "session"}>New Session</SidebarItem>
        <SidebarItem icon={History}>Session History</SidebarItem>
        <SidebarItem icon={BookOpen} to="/deepreview/files" active={active === "files"}>Scholar Files</SidebarItem>
        <SidebarItem icon={BarChart3}>Progress</SidebarItem>
      </nav>
      <div className="border-t border-line px-3 py-3 space-y-0.5">
        <SidebarItem icon={Settings} to="/deepreview/settings" active={active === "settings"}>Settings</SidebarItem>
        <div className="flex items-center gap-2 px-3 py-2 mt-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">J</div>
          <span className="text-sm text-ink">Jackey Yu</span>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon: Icon, children, active, to }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => to && navigate(to)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition ${active ? "bg-gray-100 text-ink font-medium" : "text-sub hover:bg-gray-50 hover:text-ink"}`}
    >
      <Icon size={15} />
      <span>{children}</span>
    </div>
  );
}
