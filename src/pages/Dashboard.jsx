import React, { useMemo, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Code2, Trophy, Flame, BookOpen, TrendingUp, Brain } from 'lucide-react';
import { subDays, format, isAfter } from 'date-fns';
import { toast } from 'sonner';

import StatCard from '../components/dashboard/StatCard';
import TodayFocus from '../components/dashboard/TodayFocus';
import TodayActivity from '../components/dashboard/TodayActivity';
import PatternMastery from '../components/dashboard/PatternMastery';
import RoadmapProgress from '../components/dashboard/RoadmapProgress';
import PlatformSummary from '../components/dashboard/PlatformSummary';

import {
  getDueRevisions,
  getTodaySolvedProblems,
  computePatternMastery,
} from '@/lib/patternEngine';
import { computeRoadmapProgress } from '@/lib/studyRoadmap';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const { data: problems = [] } = useQuery({
    queryKey: ['problems', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: contests = [] } = useQuery({
    queryKey: ['contests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['learning-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('learning_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['platform-profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('platform_profiles')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Mark a problem as re-solved
  const markRevisitedMutation = useMutation({
    mutationFn: async (problem) => {
      const today = new Date().toISOString().split('T')[0];
      const existingDates = problem.revision_dates || [];
      const { error } = await supabase
        .from('problems')
        .update({ revision_dates: [...existingDates, today], status: 'solved' })
        .eq('id', problem.id);
      if (error) throw error;
    },
    onSuccess: (_, problem) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success(`"${problem.title}" re-solved! Pattern understanding confirmed. 🎯`);
    },
    onError: () => toast.error('Failed to update. Please try again.'),
  });

  // Stats
  const stats = useMemo(() => {
    const solved = problems.filter(p => p.status === 'solved');
    const thisWeek = solved.filter(p =>
      isAfter(new Date(p.solved_date || p.created_date), subDays(new Date(), 7))
    );
    const lastWeek = solved.filter(p => {
      const d = new Date(p.solved_date || p.created_date);
      return isAfter(d, subDays(new Date(), 14)) && !isAfter(d, subDays(new Date(), 7));
    });

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const hit = solved.some(p => {
        const sd = p.solved_date || p.created_date;
        return sd && format(new Date(sd), 'yyyy-MM-dd') === dateStr;
      });
      if (hit) streak++;
      else if (i > 0) break;
    }

    const patternStats = computePatternMastery(problems);
    const masteredPatterns = patternStats.filter(p => p.masteryRate >= 70).length;
    const tutorialLoops = patternStats.filter(p => p.inTutorialLoop).length;

    return {
      totalSolved: solved.length,
      thisWeek: thisWeek.length,
      lastWeek: lastWeek.length,
      streak,
      contestsJoined: contests.filter(c => c.participated).length,
      learningDays: logs.length,
      masteredPatterns,
      tutorialLoops,
    };
  }, [problems, contests, logs]);

  const dueRevisions = useMemo(() => getDueRevisions(problems), [problems]);
  const todayProblems = useMemo(() => getTodaySolvedProblems(problems), [problems]);
  const patternStats = useMemo(() => computePatternMastery(problems), [problems]);
  const roadmapData = useMemo(() => computeRoadmapProgress(problems, 'tuf_az'), [problems]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your daily command center — focus on what matters right now.
        </p>
      </div>

      {/* Stat cards — only the numbers that drive daily decisions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Problems Solved"
          value={stats.totalSolved}
          icon={Code2}
          trend={`${stats.thisWeek} this week`}
          trendUp={stats.thisWeek >= stats.lastWeek}
        />
        <StatCard
          title="Streak"
          value={`${stats.streak}d`}
          icon={Flame}
          subtitle="consecutive days"
        />
        <StatCard
          title="Patterns Mastered"
          value={stats.masteredPatterns}
          icon={Brain}
          subtitle={
            stats.tutorialLoops > 0
              ? `${stats.tutorialLoops} loop${stats.tutorialLoops > 1 ? 's' : ''} detected`
              : 'Keep re-solving!'
          }
        />
        <StatCard
          title="Contests"
          value={stats.contestsJoined}
          icon={Trophy}
          subtitle="participated"
        />
      </div>

      {/* Revision queue — the most actionable thing on the page */}
      <TodayFocus
        dueProblems={dueRevisions}
        onMarkRevisited={(problem) => markRevisitedMutation.mutate(problem)}
        isUpdating={markRevisitedMutation.isPending}
      />

      {/* Roadmap + Today's activity — where you are and what you did today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoadmapProgress roadmap={roadmapData} />
        <TodayActivity todayProblems={todayProblems} />
      </div>

      {/* Pattern mastery — honest view of what you actually understand */}
      <PatternMastery patternStats={patternStats} />

      {/* Platform stats — cross-platform progress at a glance */}
      <PlatformSummary profiles={profiles} />
    </div>
  );
}
