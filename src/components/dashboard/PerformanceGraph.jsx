import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildPerformanceTimeline } from '@/lib/patternEngine';

const chartTooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(var(--foreground))',
};

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

/**
 * PerformanceGraph — shows the user's actual solving velocity over time,
 * broken down by difficulty. This makes it obvious if someone is stuck
 * only doing Easy problems (tutorial loop signal).
 */
export default function PerformanceGraph({ problems }) {
  const [range, setRange] = useState(30);
  const [view, setView] = useState('stacked'); // 'stacked' | 'area'

  const data = buildPerformanceTimeline(problems || [], range);

  // Thin out labels for readability
  const tickInterval = range === 7 ? 0 : range === 30 ? 4 : 13;

  const hasData = data.some(d => d.solved > 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Performance Graph</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {['stacked', 'area'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-2.5 py-1 transition-colors capitalize',
                  view === v
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Range toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {RANGES.map(r => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={cn(
                  'px-2.5 py-1 transition-colors',
                  range === r.days
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
          No solved problems in this range yet.
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            {view === 'stacked' ? (
              <BarChart data={data} barSize={range === 7 ? 24 : range === 30 ? 10 : 5}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval={tickInterval}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Bar dataKey="easy" name="Easy" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" name="Medium" stackId="a" fill="hsl(var(--warning))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="hard" name="Hard" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gradSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval={tickInterval}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="solved"
                  name="Problems Solved"
                  stroke="hsl(var(--primary))"
                  fill="url(#gradSolved)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Insight row */}
      {hasData && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {(() => {
            const total = data.reduce((s, d) => s + d.solved, 0);
            const hardCount = data.reduce((s, d) => s + d.hard, 0);
            const easyCount = data.reduce((s, d) => s + d.easy, 0);
            const hardRatio = total > 0 ? Math.round((hardCount / total) * 100) : 0;
            const easyRatio = total > 0 ? Math.round((easyCount / total) * 100) : 0;
            return (
              <>
                <span><span className="font-semibold text-foreground">{total}</span> solved in {range}d</span>
                {easyRatio > 60 && (
                  <span className="text-warning font-medium">
                    ⚠ {easyRatio}% Easy — push yourself harder
                  </span>
                )}
                {hardRatio >= 20 && (
                  <span className="text-success font-medium">
                    🔥 {hardRatio}% Hard — great challenge level
                  </span>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
