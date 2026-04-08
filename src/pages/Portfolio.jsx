import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code2, Trophy, Flame, GitBranch, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const platformLabels = {
  leetcode: 'LeetCode', codeforces: 'Codeforces', codechef: 'CodeChef',
  github: 'GitHub', geeksforgeeks: 'GeeksforGeeks', hackerrank: 'HackerRank'
};

const platformIcons = {
  leetcode: '🟡', codeforces: '🔵', codechef: '⭐', github: '🐱',
  geeksforgeeks: '🟢', hackerrank: '🟢'
};

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const { data: problems = [] } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const { data, error } = await supabase.from('problems').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['platform-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('platform_profiles').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: contests = [] } = useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contests').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    const solved = problems.filter(p => p.status === 'solved');
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      const hasSolved = solved.some(p => {
        const sd = p.solved_date || p.created_date;
        return sd && format(new Date(sd), 'yyyy-MM-dd') === dateStr;
      });
      if (hasSolved) streak++;
      else if (i > 0) break;
    }

    const tagCount = {};
    solved.forEach(p => (p.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    const topTopics = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // C-Score: weighted score
    const dsaScore = solved.filter(p => p.difficulty === 'easy').length * 1 +
                     solved.filter(p => p.difficulty === 'medium').length * 3 +
                     solved.filter(p => p.difficulty === 'hard').length * 5;
    const cpScore = contests.filter(c => c.participated).length * 10;
    const cScore = dsaScore + cpScore;

    return { total: solved.length, easy: solved.filter(p => p.difficulty === 'easy').length, medium: solved.filter(p => p.difficulty === 'medium').length, hard: solved.filter(p => p.difficulty === 'hard').length, streak, topTopics, cScore, contestsJoined: contests.filter(c => c.participated).length };
  }, [problems, contests]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Portfolio link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Your developer profile</p>
        </div>
        <Button variant="outline" onClick={copyLink}>
          {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Share Profile'}
        </Button>
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-xl border border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.full_name || 'Developer'}</h2>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {stats.topTopics.map(([topic]) => (
                <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 text-center bg-primary/5 border border-primary/20 rounded-xl px-6 py-4">
            <p className="text-xs text-muted-foreground font-medium">C-SCORE</p>
            <p className="text-3xl font-bold text-primary">{stats.cScore}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Code2 className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Problems Solved</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Flame className="w-6 h-6 mx-auto mb-2 text-warning" />
          <p className="text-2xl font-bold">{stats.streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold">{stats.contestsJoined}</p>
          <p className="text-xs text-muted-foreground">Contests</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <GitBranch className="w-6 h-6 mx-auto mb-2" />
          <p className="text-2xl font-bold">{profiles.length}</p>
          <p className="text-xs text-muted-foreground">Platforms</p>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Difficulty Breakdown</h3>
        <div className="flex gap-4">
          {[
            { label: 'Easy', count: stats.easy, color: 'text-success', bg: 'bg-success' },
            { label: 'Medium', count: stats.medium, color: 'text-warning', bg: 'bg-warning' },
            { label: 'Hard', count: stats.hard, color: 'text-destructive', bg: 'bg-destructive' },
          ].map(d => (
            <div key={d.label} className="flex-1 text-center">
              <p className={cn("text-xl font-bold", d.color)}>{d.count}</p>
              <div className={cn("h-1 rounded-full mt-1", d.bg, "opacity-30")} />
              <p className="text-xs text-muted-foreground mt-1">{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Platforms */}
      {profiles.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Connected Platforms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profiles.map(profile => (
              <div key={profile.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <span className="text-xl">{platformIcons[profile.platform] || '📝'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{platformLabels[profile.platform]}</p>
                  <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                </div>
                <div className="text-right">
                  {profile.rating && <p className="text-sm font-mono font-medium">{profile.rating}</p>}
                  <p className="text-xs text-muted-foreground">{profile.problems_solved || 0} solved</p>
                </div>
                {profile.profile_url && (
                  <a href={profile.profile_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}