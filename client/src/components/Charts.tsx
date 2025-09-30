// client/src/components/Charts.tsx
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

// Try to use recharts if it exists; otherwise we render a table fallback.
let Recharts:
  | { LineChart:any; Line:any; XAxis:any; YAxis:any; Tooltip:any; CartesianGrid:any; ResponsiveContainer:any }
  | null = null;
try {
  // @ts-ignore
  const rc = require('recharts');
  Recharts = {
    LineChart: rc.LineChart,
    Line: rc.Line,
    XAxis: rc.XAxis,
    YAxis: rc.YAxis,
    Tooltip: rc.Tooltip,
    CartesianGrid: rc.CartesianGrid,
    ResponsiveContainer: rc.ResponsiveContainer,
  };
} catch {
  Recharts = null;
}

type MonthlyRow = { month: string; total: number };

export default function Charts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/monthly-donations'],
    queryFn: async () => {
      const res = await fetch('/api/monthly-donations', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch monthly donations');
      const json = await res.json();
      return (json?.data ?? []) as MonthlyRow[];
    },
    staleTime: 0,
  });

  if (isLoading) return <div>Loading chart…</div>;
  if (error) return <div className="text-red-600">Couldn’t load chart.</div>;

  const rows = (data ?? []).map(r => ({
    month: prettyMonth(r.month),
    total: Number(r.total ?? 0),
  }));

  if (Recharts && rows.length > 0) {
    const { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } = Recharts;
    return (
      <div className="h-72 w-full rounded-lg border p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback table if recharts isn't installed
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 font-semibold">Monthly Donations</div>
      <table className="w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr><th className="py-1">Month</th><th className="py-1">Total (USD)</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.month} className="border-t">
              <td className="py-1">{r.month}</td>
              <td className="py-1">${r.total.toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={2} className="py-2 text-gray-500">No data yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function prettyMonth(m: string) {
  if (!m) return m;
  const [y, mo] = m.split('-');
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}
