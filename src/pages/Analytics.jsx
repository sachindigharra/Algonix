import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, startOfWeek, eachDayOfInterval, eachWeekOfInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const chartTooltipStyle = {
  background: 'hsl(222, 47%, 9%)',
  border: '1px solid hsl(222, 40%, 16%)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#fff',
};

export default function Analytics() {
  const { data: problems = [] } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const { data, error } = await supabase.from('problems').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });

  const solved = useMemo(() => problems.filter(p => p.status === 'solved'), [problems]);

  // Daily progress (last 30 days)
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return days.map(day => {
      const key = format(day, 'yyyy-MM-dd');
      const count = solved.filter(p => {
        const sd = p.solved_date || p.created_date;
        return sd && format(new Date(sd), 'yyyy-MM-dd') === key;
      }).length;
      return { date: format(day, 'MMM d'), count };
    });
  }, [solved]);

  // Weekly progress (last 12 weeks)
  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: subDays(new Date(), 83), end: new Date() });
    return weeks.map((weekStart, i) => {
      const weekEnd = i < weeks.length - 1 ? weeks[i + 1] : new Date();
      const count = solved.filter(p => {
        const sd = p.solved_date || p.created_date;
        if (!sd) return false;
        const d = new Date(sd);
        return d >= weekStart && d < weekEnd;
      }).length;
      return { week: `W${format(weekStart, 'w')}`, count };
    });
  }, [solved]);

  // Platform distribution
  const platformData = useMemo(() => {
    const counts = {};
    solved.forEach(p => { counts[p.platform] = (counts[p.platform] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [solved]);

  // Weak areas - topics with low solve count
  const topicAnalysis = useMemo(() => {
    const tagStats = {};
    problems.forEach(p => {
      (p.tags || []).forEach(tag => {
        if (!tagStats[tag]) tagStats[tag] = { total: 0, solved: 0 };
        tagStats[tag].total++;
        if (p.status === 'solved') tagStats[tag].solved++;
      });
    });
    return Object.entries(tagStats)
      .map(([name, stats]) => ({ name, ...stats, rate: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0 }))
      .sort((a, b) => a.rate - b.rate);
  }, [problems]);

  // Sheet progress
  const sheetProgress = useMemo(() => {
    const sheets = { blind75: { name: 'Blind 75', total: 75 }, striver_sde: { name: 'Striver SDE', total: 191 }, neetcode150: { name: 'NeetCode 150', total: 150 }, grind75: { name: 'Grind 75', total: 75 } };
    return Object.entries(sheets).map(([key, info]) => {
      const solvedCount = solved.filter(p => p.sheet === key).length;
      return { key, ...info, solved: solvedCount, pct: Math.round((solvedCount / info.total) * 100) };
    });
  }, [solved]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep insights into your coding performance</p>
      </div>

      {/* Daily Progress */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Daily Progress (Last 30 Days)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 100%, 52%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210, 100%, 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="hsl(210, 100%, 52%)" fill="url(#colorCount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Progress */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Weekly Progress</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 16%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Platform Distribution</h3>
          <div className="space-y-3">
            {platformData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : platformData.map(p => {
              const pct = solved.length ? Math.round((p.value / solved.length) * 100) : 0;
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium capitalize">{p.name}</span>
                    <span className="text-muted-foreground">{p.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sheet Progress */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Sheet Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sheetProgress.map(sheet => (
            <div key={sheet.key} className="border border-border rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">{sheet.name}</p>
              <p className="text-lg font-bold">{sheet.solved}<span className="text-sm text-muted-foreground font-normal">/{sheet.total}</span></p>
              <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-success rounded-full transition-all duration-500" style={{ width: `${sheet.pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{sheet.pct}% complete</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Topic Analysis</h3>
        {topicAnalysis.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Add problems with tags to see analysis</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topicAnalysis.map(topic => (
              <div key={topic.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">{topic.solved}/{topic.total} solved</p>
                </div>
                <Badge className={cn("text-xs",
                  topic.rate >= 70 ? 'bg-success/10 text-success' :
                  topic.rate >= 40 ? 'bg-warning/10 text-warning' :
                  'bg-destructive/10 text-destructive'
                )}>
                  {topic.rate}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}