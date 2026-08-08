import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * RoadmapProgress — compact dashboard widget showing the user's
 * current position in the pattern-wise study path.
 */
export default function RoadmapProgress({ roadmap }) {
  if (!roadmap || roadmap.length === 0) return null;

  const completed = roadmap.filter(t => t.status === 'completed');
  const active = roadmap.find(t => t.status === 'active');
  const nextUp = roadmap.filter(t => t.status === 'unlocked').slice(0, 2);
  const overallPct = Math.round((completed.length / roadmap.length) * 100);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Study Roadmap</h3>
        <Link
          to="/roadmap"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Full roadmap <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Overall progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
          {completed.length}/{roadmap.length} topics
        </span>
      </div>

      {/* Completed topics — compact chips */}
      {completed.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Completed</p>
          <div className="flex flex-wrap gap-1.5">
            {completed.map(t => (
              <span
                key={t.id}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium"
              >
                <CheckCircle2 className="w-3 h-3" />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Active topic */}
      {active && (
        <div className="mb-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs font-semibold text-warning">Now Studying</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {active.solvedCount}/{active.minProblems}
            </span>
          </div>
          <p className="text-sm font-semibold">
            {active.icon} {active.label}
          </p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-warning rounded-full transition-all duration-700"
              style={{ width: `${active.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Up next */}
      {nextUp.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Up Next</p>
          <div className="space-y-1">
            {nextUp.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
