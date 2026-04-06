import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function DifficultyBreakdown({ problems }) {
  const stats = useMemo(() => {
    const solved = (problems || []).filter(p => p.status === 'solved');
    return {
      easy: solved.filter(p => p.difficulty === 'easy').length,
      medium: solved.filter(p => p.difficulty === 'medium').length,
      hard: solved.filter(p => p.difficulty === 'hard').length,
      total: solved.length,
    };
  }, [problems]);

  const bars = [
    { label: 'Easy', count: stats.easy, color: 'bg-success', textColor: 'text-success' },
    { label: 'Medium', count: stats.medium, color: 'bg-warning', textColor: 'text-warning' },
    { label: 'Hard', count: stats.hard, color: 'bg-destructive', textColor: 'text-destructive' },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Difficulty Breakdown</h3>
      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={cn("font-medium", bar.textColor)}>{bar.label}</span>
              <span className="font-mono text-muted-foreground">{bar.count}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", bar.color)}
                style={{ width: `${stats.total ? (bar.count / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total Solved</span>
        <span className="text-lg font-bold">{stats.total}</span>
      </div>
    </div>
  );
}