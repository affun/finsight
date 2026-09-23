"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

/**
 * Recharts must stay inside client components: importing it from a server
 * component pulls it into the server bundle, where its module-init order
 * crashes page-data collection. This keeps the account card server-rendered.
 */
export function AccountSparkline({ color, seedValue }: { color: string; seedValue: number }) {
  const data = [0, 1, 2, 3, 4, 5].map((i) => ({
    v: seedValue * (0.92 + i * 0.016),
    i,
  }));

  return (
    <div style={{ width: 100, height: 50 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color.replace("#", "")})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
