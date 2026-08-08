import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, CheckCircle2, ExternalLink, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryPattern, REVISION_INTERVAL_DAYS } from '@/lib/patternEngine';
import { format } from 'date-fns';

const difficultyStyles = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  hard: 'bg-destructive/10 text-destructive border-destructive/20',
};

const platformIcons = {
  leetcode: '🟡', codeforces: '🔵', codechef: '⭐',
  geeksforgeeks: '🟢', hackerrank: '🟢', other: '📝',
};

/**
 * TodayFocus — the anti-tutorial-loop widget.
 *
 * Shows problems that are due for re-attempt (solved 3+ days ago,
 * high-frequency pattern, never re-attempted). The user must
 * re-solve them cold to prove actual understanding.
 */
export default function TodayFocus({ dueProblems, onMarkRevisited, isUpdating }) {
  if (dueProblems.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Today's Revision Queue</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Problems from high-frequency patterns due for re-attempt
        </p>
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-success opacity-60" />
          <p className="text-sm font-medium text-muted-foreground">You're all caught up!</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Solve more problems tagged with patterns like Two Pointers, DP, or BFS — they'll appear here in {REVISION_INTERVAL_DAYS} days for re-attempt.
          </p>
          <Link to="/problems">
            <Button variant="outline" size="sm" className="mt-2">Browse Problems</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold">Today's Revision Queue</h3>
          <span className="text-xs bg-warning/10 text-warning font-semibold px-2 py-0.5 rounded-full">
            {dueProblems.length} due
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        These were solved {REVISION_INTERVAL_DAYS}+ days ago. Re-solve them <span className="text-foreground font-medium">without looking at your notes</span> to prove real understanding.
      </p>

      {/* Tutorial loop warning */}
      <div className="flex items-start gap-2 bg-warning/5 border border-warning/20 rounded-lg p-3 mb-4">
        <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <span className="text-warning font-medium">Break the tutorial loop.</span> Watching solutions doesn't build pattern recognition. Re-solving cold does.
        </p>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
        {dueProblems.map(problem => {
          const solvedDate = problem.solved_date || problem.created_at?.split('T')[0];
          const pattern = getPrimaryPattern(problem);

          return (
            <div
              key={problem.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-warning/40 hover:bg-warning/5 transition-all group"
            >
              <span className="text-base flex-shrink-0">
                {platformIcons[problem.platform] || '📝'}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium truncate">{problem.title}</p>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] border flex-shrink-0', difficultyStyles[problem.difficulty])}
                  >
                    {problem.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    Solved {solvedDate ? format(new Date(solvedDate), 'MMM d') : 'recently'}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                    {pattern}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {problem.url && (
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                    title="Open problem"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-success/40 text-success hover:bg-success/10 hover:border-success"
                  onClick={() => onMarkRevisited(problem)}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Re-solved
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
