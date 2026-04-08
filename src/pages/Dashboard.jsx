import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Code2, Trophy, Flame, Target, BookOpen } from 'lucide-react';
import { subDays, format, isAfter } from 'date-fns';
import StatCard from '../components/dashboard/StatCard';
import StreakHeatmap from '../components/dashboard/StreakHeatmap';
import TopicChart from '../components/dashboard/TopicChart';
import DifficultyBreakdown from '../components/dashboard/DifficultyBreakdown';
import RecentProblems from '../components/dashboard/RecentProblems';

export default function Dashboard() {
  const { data: problems = [] } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const { data, error } = await supabase.from('problems').select('*').order('created_at', { ascending: false }).limit(500);
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

  const { data: logs = [] } = useQuery({
    queryKey: ['learning-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('learning_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    const solved = problems.filter(p => p.status === 'solved');
    const thisWeek = solved.filter(p => {
      const d = new Date(p.solved_date || p.created_date);
      return isAfter(d, subDays(new Date(), 7));
    });
    const lastWeek = solved.filter(p => {
      const d = new Date(p.solved_date || p.created_date);
      return isAfter(d, subDays(new Date(), 14)) && !isAfter(d, subDays(new Date(), 7));
    });

    // Calculate streak
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

    return {
      totalSolved: solved.length,
      thisWeek: thisWeek.length,
      lastWeek: lastWeek.length,
      streak,
      contestsJoined: contests.filter(c => c.participated).length,
      learningDays: logs.length,
    };
  }, [problems, contests, logs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your coding journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Problems Solved"
          value={stats.totalSolved}
          icon={Code2}
          trend={`${stats.thisWeek} this week`}
          trendUp={stats.thisWeek >= stats.lastWeek}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.streak} days`}
          icon={Flame}
          subtitle="Keep it going!"
        />
        <StatCard
          title="Contests"
          value={stats.contestsJoined}
          icon={Trophy}
          subtitle="Participated"
        />
        <StatCard
          title="Learning Days"
          value={stats.learningDays}
          icon={BookOpen}
          subtitle="Entries logged"
        />
      </div>

      {/* Heatmap */}
      <StreakHeatmap problems={problems.filter(p => p.status === 'solved')} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DifficultyBreakdown problems={problems} />
        <TopicChart problems={problems.filter(p => p.status === 'solved')} />
        <RecentProblems problems={problems} />
      </div>
    </div>
  );
}