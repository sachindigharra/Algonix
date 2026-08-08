import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORM_META } from '@/lib/platformFetcher';
import { formatDistanceToNow } from 'date-fns';

/**
 * PlatformSummary — compact dashboard widget.
 * Shows each connected platform's key stat at a glance.
 * Drives the user to Portfolio for full details.
 */
export default function PlatformSummary({ profiles = [] }) {
  if (profiles.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Platform Stats</h3>
          <Link to="/portfolio" className="text-xs text-primary hover:underline flex items-center gap-1">
            Add platforms <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Connect LeetCode, Codeforces and more to track stats here.
        </p>
      </div>
    );
  }

  const totalSolved = profiles.reduce((s, p) => s + (p.problems_solved || 0), 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Platform Stats</h3>
          <span className="text-xs text-muted-foreground">
            {totalSolved} combined solved
          </span>
        </div>
        <Link to="/portfolio" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {profiles.map(profile => {
          const pm = PLATFORM_META[profile.platform] || {};
          const mainStat = profile.platform === 'leetcode'
            ? profile.rating ? `Rank #${profile.rating.toLocaleString()}` : `${profile.problems_solved ?? 0} solved`
            : profile.rating
              ? `${profile.rating}${profile.rank_title ? ` · ${profile.rank_title}` : ''}`
              : `${profile.problems_solved ?? 0} solved`;

          return (
            <div key={profile.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <span className="text-lg flex-shrink-0">{pm.icon || '📝'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{pm.label || profile.platform}</p>
                  <p className="text-xs font-mono font-semibold">{profile.problems_solved ?? 0}</p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-muted-foreground truncate">@{profile.username}</p>
                  <p className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{mainStat}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
