import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ExternalLink, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const difficultyStyles = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  hard: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusStyles = {
  solved: 'bg-success/10 text-success',
  attempted: 'bg-warning/10 text-warning',
  todo: 'bg-muted text-muted-foreground',
  revisit: 'bg-accent/10 text-accent',
};

const platformLabels = {
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  codechef: 'CodeChef',
  geeksforgeeks: 'GFG',
  hackerrank: 'HackerRank',
  other: 'Other',
};

export default function ProblemTable({ problems, onEdit, onDelete }) {
  if (problems.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <p className="text-muted-foreground">No problems found. Add your first problem!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Problem</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Platform</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Difficulty</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Tags</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Date</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate max-w-[200px]">{problem.title}</span>
                    {problem.url && (
                      <a href={problem.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-muted-foreground">{platformLabels[problem.platform]}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn("text-[10px] border", difficultyStyles[problem.difficulty])}>
                    {problem.difficulty}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge className={cn("text-[10px]", statusStyles[problem.status])}>
                    {problem.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(problem.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-primary/5 text-primary text-[10px] rounded">
                        {tag}
                      </span>
                    ))}
                    {(problem.tags || []).length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{problem.tags.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {problem.solved_date ? format(new Date(problem.solved_date), 'MMM d') : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(problem)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(problem.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}