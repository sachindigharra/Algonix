import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(210, 100%, 52%)', 'hsl(262, 83%, 58%)', 'hsl(142, 71%, 45%)', 
  'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(180, 60%, 45%)',
  'hsl(300, 60%, 50%)', 'hsl(45, 80%, 55%)'
];

export default function TopicChart({ problems }) {
  const data = useMemo(() => {
    const tagCount = {};
    (problems || []).forEach(p => {
      (p.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [problems]);

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Topic Distribution</h3>
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
          Solve problems with tags to see distribution
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Topic Distribution</h3>
      <div className="flex items-center gap-4">
        <div className="w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 16%)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.slice(0, 6).map((item, i) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground truncate">{item.name}</span>
              <span className="ml-auto font-mono font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}