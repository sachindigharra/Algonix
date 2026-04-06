import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const difficultyStyles = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  hard: 'bg-destructive/10 text-destructive border-destructive/20',
};

const platformIcons = {
  leetcode: '🟡',
  codeforces: '🔵',
  codechef: '⭐',
  geeksforgeeks: '🟢',
  hackerrank: '🟢',
  other: '📝',
};

export default function RecentProblems({ problems }) {
  const recent = (problems || [])
    .filter(p => p.status === 'solved')
    .sort((a, b) => new Date(b.solved_date || b.created_date) - new Date(a.solved_date || a.created_date))
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recently Solved</h3>
        <Link to="/problems" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No problems solved yet. Start coding!</p>
      ) : (
        <div className="space-y-2">
          {recent.map((problem) => (
            <div
              key={problem.id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <span className="text-lg">{platformIcons[problem.platform] || '📝'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{problem.title}</p>
                <p className="text-xs text-muted-foreground">
                  {problem.solved_date ? format(new Date(problem.solved_date), 'MMM d') : 'Recently'}
                </p>
              </div>
              <Badge variant="outline" className={cn("text-[10px] border", difficultyStyles[problem.difficulty])}>
                {problem.difficulty}
              </Badge>
              {problem.url && (
                <a href={problem.url} target="_blank" rel="noopener noreferrer"
                   className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}