import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ show, onClose, children }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-bottom-2">
      <CheckCircle2 size={16} className="text-emerald-400" />
      {children}
    </div>
  );
}
