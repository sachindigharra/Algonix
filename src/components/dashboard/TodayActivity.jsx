import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Sun, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryPattern, isHighFrequencyProblem, REVISION_INTERVAL_DAYS } from '@/lib/patternEngine';
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
 * TodayActivity — shows what the user solved today.
 * For high-frequency pattern problems, shows a "revision scheduled" badge
 * so the user knows it'll come back in 3 days.
 */
export default function TodayActivity({ todayProblems }) {
  const today = format(new Date(), 'EEEE, MMMM d');

  if (todayProblems.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold">Today's Activity</h3>
          <span className="text-xs text-muted-foreground ml-auto">{today}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <Flame className="w-7 h-7 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Nothing solved yet today.</p>
          <p className="text-xs text-muted-foreground">Start with a medium-difficulty problem from your weakest pattern.</p>
        </div>
      </div>
    );
  }

  const hfCount = todayProblems.filter(isHighFrequencyProblem).length;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sun className="w-4 h-4 text-warning" />
        <h3 className="text-sm font-semibold">Today's Activity</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium ml-auto">
          {todayProblems.length} solved
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {today}
        {hfCount > 0 && (
          <span className="ml-2 text-primary">
            · {hfCount} pattern problem{hfCount > 1 ? 's' : ''} scheduled for revision in {REVISION_INTERVAL_DAYS} days
          </span>
        )}
      </p>

      <div className="space-y-2">
        {todayProblems.map(problem => {
          const isHF = isHighFrequencyProblem(problem);
          const pattern = isHF ? getPrimaryPattern(problem) : null;

          return (
            <div
              key={problem.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors group"
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
                {isHF && pattern && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      {pattern}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      → revision in {REVISION_INTERVAL_DAYS}d
                    </span>
                  </div>
                )}
              </div>

              {problem.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
