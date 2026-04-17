import { ShellLayout, AdminSidebar } from "../../components/Layout.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  SAFETY_EVENTS,
  SAFETY_EVENTS_CHART,
  COST_BY_TIER,
} from "../../data.js";

const TIER_COLORS = ["#38C9A8", "#4F8EF7", "#E8914F"];

export default function AdminDashboard() {
  return (
    <ShellLayout
      role="admin"
      sidebar={<AdminSidebar />}
      breadcrumb={[{ label: "Admin Portal" }, { label: "Dashboard" }]}
    >
      <div className="p-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sub text-sm mt-1">
            Platform health, safety, and cost
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Safety Flags (24hr)" value="38 flagged" tint="amber" />
          <Stat label="Inputs Blocked" value="29" tint="rose" />
          <Stat label="Platform Cost (7d)" value="$1,240" />
          <Stat label="Apps in Review" value="7 pending" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink2 mb-4">
              Safety Events (7d)
            </h3>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={SAFETY_EVENTS_CHART}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="day" stroke="#8A8A8A" fontSize={11} />
                  <YAxis stroke="#8A8A8A" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="flagged" fill="#F59E0B" />
                  <Bar dataKey="blocked" fill="#E11D48" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink2 mb-4">
              Cost by Model Tier
            </h3>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={COST_BY_TIER}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {COST_BY_TIER.map((_, i) => (
                      <Cell key={i} fill={TIER_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-sub mt-2">
              Tier 3 = ~10% of requests but 50% of cost
            </p>
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="text-sm font-semibold text-ink2">
              Recent Safety Events
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-sub uppercase tracking-wide">
              <tr>
                <Th>Time</Th>
                <Th>App</Th>
                <Th>Event</Th>
                <Th>Layer</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {SAFETY_EVENTS.map((e, i) => (
                <tr key={i} className="border-t border-line">
                  <Td className="text-sub">{e.time}</Td>
                  <Td>{e.app}</Td>
                  <Td>{e.event}</Td>
                  <Td><span className="pill">{e.layer}</span></Td>
                  <Td>
                    <span
                      className={`pill ${
                        e.action === "Blocked"
                          ? "!bg-rose-100 !text-rose-700"
                          : e.action === "Redacted"
                          ? "!bg-amber-100 !text-amber-700"
                          : "!bg-blue-100 !text-blue-700"
                      }`}
                    >
                      {e.action}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ShellLayout>
  );
}

function Stat({ label, value, tint }) {
  const tintClass =
    tint === "amber"
      ? "text-amber-600"
      : tint === "rose"
      ? "text-rose-600"
      : "text-ink";
  return (
    <div className="card p-4">
      <div className="text-xs text-sub mb-1.5">{label}</div>
      <div className={`text-2xl font-semibold ${tintClass}`}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left font-medium px-5 py-2.5">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-5 py-3 ${className}`}>{children}</td>;
}
