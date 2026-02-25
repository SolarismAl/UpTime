'use client';

import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { CheckResult } from '../types';

export function UptimeChart({ history }: { history: CheckResult[] }) {
  const data = history.map((h, i) => ({
    index: i,
    time: h.responseTime || 0,
    status: h.status,
  }));

  if (data.length === 0) {
    return (
      <div className="h-16 flex items-center justify-center text-zinc-400 text-xs font-mono">
        No data yet
      </div>
    );
  }

  return (
    <div className="h-16 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const { time, status } = payload[0].payload;
                return (
                  <div className="bg-white border border-zinc-200 px-2 py-1 rounded text-xs shadow-md">
                    <div className="font-mono text-zinc-700">{time.toFixed(0)}ms</div>
                    <div className={status === 'online' ? 'text-emerald-600' : 'text-red-600'}>
                      {status}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="time"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
