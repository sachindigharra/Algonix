import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * PatternMastery — shows per-pattern understanding scores.
 *
 * The key insight: a pattern is only "mastered" if the user
 * solved a problem, then came back 3 days later and re-solved it cold.
 * Just solving once = "seen it". Re-solving = "understood it".
 */
export default function PatternMastery({ patternStats }) {
  const [expanded, setExpanded] = useState(false);

  if (!patternStats || patternStats.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Pattern Mastery</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          Solve problems with DSA pattern tags to see your mastery scores.
        </p>
      </div>
    );
  }

  const tutorialLoopCount = patternStats.filter(p => p.inTutorialLoop).length;
  const masteredCount = patternStats.filter(p => p.masteryRate >= 70).length;
  const displayStats = expanded ? patternStats : patternStats.slice(0, 6);

  const getMasteryLabel = (rate, inLoop) => {
    if (inLoop) return { label: 'Tutorial Loop', color: 'text-destructive', bg: 'bg-destructive/10' };
    if (rate === 0) return { label: 'Not Started', color: 'text-muted-foreground', bg: 'bg-muted' };
    if (rate < 40) return { label: 'Learning', color: 'text-warning', bg: 'bg-warning/10' };
    if (rate < 70) return { label: 'Practicing', color: 'text-primary', bg: 'bg-primary/10' };
    return { label: 'Mastered', color: 'text-success', bg: 'bg-success/10' };
  };

  const getBarColor = (rate, inLoop) => {
    if (inLoop) return 'bg-destructive';
    if (rate < 40) return 'bg-warning';
    if (rate < 70) return 'bg-primary';
    return 'bg-success';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Pattern Mastery</h3>
        </div>
        <div className="flex items-center gap-2">
          {tutorialLoopCount > 0 && (
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {tutorialLoopCount} loop{tutorialLoopCount > 1 ? 's' : ''}
            </span>
          )}
          {masteredCount > 0 && (
            <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {masteredCount} mastered
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Mastery = solved + re-solved cold after {3} days. "Tutorial Loop" = solved once, never re-attempted.
      </p>

      <div className="space-y-3">
        {displayStats.map(stat => {
          const { label, color, bg } = getMasteryLabel(stat.masteryRate, stat.inTutorialLoop);
          const barColor = getBarColor(stat.masteryRate, stat.inTutorialLoop);
          const displayRate = stat.inTutorialLoop ? 0 : stat.masteryRate;

          return (
            <div key={stat.pattern} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stat.pattern}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', bg, color)}>
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{stat.mastered}/{stat.solved} re-solved</span>
                  <span className="font-mono font-semibold text-foreground w-8 text-right">
                    {displayRate}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', barColor)}
                  style={{ width: `${Math.max(displayRate, stat.inTutorialLoop ? 8 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {patternStats.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Show {patternStats.length - 6} more patterns</>
          )}
        </button>
      )}
    </div>
  );
}
