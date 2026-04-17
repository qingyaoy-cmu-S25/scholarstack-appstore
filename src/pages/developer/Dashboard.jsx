import { ShellLayout, DeveloperSidebar } from "../../components/Layout.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { REQUESTS_BY_TIER, LATENCY_DATA, DEV_ERRORS } from "../../data.js";
import { TrendingDown } from "lucide-react";

export default function DeveloperDashboard() {
  return (
    <ShellLayout
      role="developer"
      sidebar={<DeveloperSidebar />}
      breadcrumb={[
        { label: "Developer Portal" },
        { label: "Dashboard" },
      ]}
    >
      <div className="p-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sub text-sm mt-1">
            Observability for your published apps
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Avg Latency (p50)" value="340ms" delta="↓12%" good />
          <Stat label="Error Rate (24hr)" value="0.4%" good />
          <Stat label="RAG Hit Rate" value="82%" />
          <Stat label="Token Usage (30d)" value="4.2M" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink2 mb-4">
              Requests by Model Tier (7d)
            </h3>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={REQUESTS_BY_TIER}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="day" stroke="#8A8A8A" fontSize={11} />
                  <YAxis stroke="#8A8A8A" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Tier 1" stackId="a" fill="#38C9A8" />
                  <Bar dataKey="Tier 2" stackId="a" fill="#4F8EF7" />
                  <Bar dataKey="Tier 3" stackId="a" fill="#E8914F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink2 mb-4">
              Latency p50/p95 (7d)
            </h3>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={LATENCY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="day" stroke="#8A8A8A" fontSize={11} />
                  <YAxis stroke="#8A8A8A" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    stroke="#4F8EF7"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="p95"
                    stroke="#8A8A8A"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="text-sm font-semibold text-ink2">Recent Errors</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-sub uppercase tracking-wide">
              <tr>
                <Th>Trace ID</Th>
                <Th>Time</Th>
                <Th>Error</Th>
                <Th>Tier</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {DEV_ERRORS.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <Td><code className="font-mono text-xs">{e.id}</code></Td>
                  <Td className="text-sub">{e.time}</Td>
                  <Td>{e.error}</Td>
                  <Td><span className="pill">{e.tier}</span></Td>
                  <Td>{e.status}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ShellLayout>
  );
}

function Stat({ label, value, delta, good }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-sub mb-1.5">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-ink">{value}</span>
        {delta && (
          <span
            className={`text-xs flex items-center gap-0.5 ${
              good ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            <TrendingDown size={11} />
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left font-medium px-5 py-2.5">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-5 py-3 ${className}`}>{children}</td>;
}
