import React, { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, Zap, Circle, ChevronRight, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { computeRoadmapProgress, detectActiveTopic } from '@/lib/studyRoadmap';

const statusConfig = {
  completed: { icon: CheckCircle2, iconClass: 'text-success',          cardClass: 'border-success/30 bg-success/5',                        badge: 'bg-success/10 text-success',          label: 'Completed'   },
  active:    { icon: Zap,          iconClass: 'text-warning',           cardClass: 'border-warning/50 bg-warning/5 shadow-sm shadow-warning/10', badge: 'bg-warning/10 text-warning',          label: 'In Progress' },
  unlocked:  { icon: Circle,       iconClass: 'text-primary',           cardClass: 'border-border hover:border-primary/40 hover:bg-primary/5',   badge: 'bg-primary/10 text-primary',          label: 'Ready'       },
  locked:    { icon: Lock,         iconClass: 'text-muted-foreground',  cardClass: 'border-border opacity-50',                              badge: 'bg-muted text-muted-foreground',       label: 'Locked'      },
};

const SHEETS = [
  {
    id: 'generic',
    label: 'Pattern Roadmap',
    description: 'Generic pattern-wise path — good for any platform',
    badge: null,
  },
  {
    id: 'tuf_az',
    label: 'TUF A-Z Sheet',
    description: "Striver's A-Z DSA Course — exact step sequence",
    badge: 'Popular',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course',
  },
];

export default function Roadmap() {
  const [user, setUser] = useState(null);
  const [activeSheet, setActiveSheet] = useState('tuf_az'); // default to TUF since user follows it

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const { data: problems = [] } = useQuery({
    queryKey: ['problems', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('problems').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const roadmap = useMemo(() => computeRoadmapProgress(problems, activeSheet), [problems, activeSheet]);
  const activeTopic = useMemo(() => detectActiveTopic(roadmap), [roadmap]);

  const completedCount = roadmap.filter(t => t.status === 'completed').length;
  const overallProgress = Math.round((completedCount / roadmap.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete topics in order — not randomly.
          </p>
        </div>
        <Link to="/problems" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          Go to Problems <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sheet switcher */}
      <div className="flex gap-2 flex-wrap">
        {SHEETS.map(sheet => (
          <button
            key={sheet.id}
            onClick={() => setActiveSheet(sheet.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              activeSheet === sheet.id
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            )}
          >
            {sheet.label}
            {sheet.badge && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                activeSheet === sheet.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-warning/10 text-warning'
              )}>
                {sheet.badge}
              </span>
            )}
          </button>
        ))}
        {/* External link for TUF */}
        {activeSheet === 'tuf_az' && (
          <a
            href="https://takeuforward.org/strivers-a2z-dsa-course"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open TUF Sheet
          </a>
        )}
      </div>

      {/* Overall progress */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold">
              {activeSheet === 'tuf_az' ? "Striver's A-Z Progress" : 'Overall Progress'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {roadmap.length} steps completed
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Completed',   count: roadmap.filter(t => t.status === 'completed').length, cls: 'bg-success/10 text-success' },
            { label: 'In Progress', count: roadmap.filter(t => t.status === 'active').length,    cls: 'bg-warning/10 text-warning' },
            { label: 'Ready',       count: roadmap.filter(t => t.status === 'unlocked').length,  cls: 'bg-primary/10 text-primary' },
            { label: 'Locked',      count: roadmap.filter(t => t.status === 'locked').length,    cls: 'bg-muted text-muted-foreground' },
          ].map(s => (
            <span key={s.label} className={cn('text-xs px-2.5 py-1 rounded-full font-medium', s.cls)}>
              {s.count} {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Current focus callout */}
      {activeTopic && (
        <div className="bg-card rounded-xl border border-warning/40 p-5 flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">{activeTopic.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">Currently Studying</p>
              <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">Active</span>
              {activeTopic.step && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  Step {activeTopic.step}
                </span>
              )}
            </div>
            <p className="text-base font-bold mt-0.5">{activeTopic.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeTopic.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-warning rounded-full transition-all duration-700" style={{ width: `${activeTopic.progress}%` }} />
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {activeTopic.solvedCount}/{activeTopic.minProblems} problems
              </span>
            </div>
          </div>
          <Link
            to={`/problems?pattern=${encodeURIComponent(activeTopic.patterns[0])}`}
            className="flex-shrink-0 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Practice <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Roadmap steps */}
      <div className="space-y-3">
        {roadmap.map((topic, index) => {
          const cfg = statusConfig[topic.status];
          return (
            <div
              key={topic.id}
              className={cn(
                'bg-card rounded-xl border p-4 transition-all duration-200',
                cfg.cardClass,
                topic.status === 'locked' ? 'cursor-not-allowed' : 'cursor-default'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                    topic.status === 'completed' ? 'border-success bg-success/10 text-success' :
                    topic.status === 'active'    ? 'border-warning bg-warning/10 text-warning' :
                    topic.status === 'unlocked'  ? 'border-primary bg-primary/10 text-primary' :
                    'border-border bg-muted text-muted-foreground'
                  )}>
                    {topic.status === 'completed'
                      ? <CheckCircle2 className="w-4 h-4" />
                      : topic.step ?? index + 1}
                  </div>
                  {index < roadmap.length - 1 && (
                    <div className={cn('w-0.5 h-4 mt-1 rounded-full', topic.status === 'completed' ? 'bg-success/40' : 'bg-border')} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{topic.icon}</span>
                      <div>
                        <p className={cn('text-sm font-semibold', topic.status === 'locked' && 'text-muted-foreground')}>
                          {topic.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-md">{topic.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', cfg.badge)}>{cfg.label}</span>
                      {topic.status !== 'locked' && (
                        <Link
                          to={`/problems?pattern=${encodeURIComponent(topic.patterns[0])}`}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <BookOpen className="w-3 h-3" /> Practice
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {topic.status !== 'locked' && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700',
                            topic.status === 'completed' ? 'bg-success' :
                            topic.status === 'active'    ? 'bg-warning' : 'bg-primary'
                          )}
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 font-mono">
                        {topic.solvedCount}/{topic.minProblems}
                      </span>
                    </div>
                  )}

                  {/* Pattern tags + lock reason */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {topic.patterns.map(pat => (
                      <span key={pat} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                        {pat}
                      </span>
                    ))}
                    {topic.status === 'locked' && topic.prerequisites.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        🔒 Complete: {topic.prerequisites.map(id => roadmap.find(t => t.id === id)?.label || id).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
