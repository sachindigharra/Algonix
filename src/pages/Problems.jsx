import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProblems, createProblem, updateProblemMeta, updateProblemTracking, deleteProblem } from '@/api/problemApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, X, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProblemTable from '../components/problems/ProblemTable';
import ProblemFormDialog from '../components/problems/ProblemFormDialog';
import PatternFilter from '../components/problems/PatternFilter';
import TopicFilter from '../components/problems/TopicFilter';
import { useAuth } from '@/lib/auth-context';

// ─── Curated company sheets ────────────────────────────────────────────────
// Each sheet pre-applies a company filter (one company or multi-company logic).
// `companies: []` means no company filter — shows all problems.
const CURATED_SHEETS = [
  {
    id: 'faang',
    label: 'FAANG',
    emoji: '🏆',
    description: 'Meta · Apple · Amazon · Netflix · Google',
    companies: ['Meta', 'Apple', 'Amazon', 'Netflix', 'Google'],
    color: 'data-[active=true]:border-yellow-500/60 data-[active=true]:bg-yellow-500/10 data-[active=true]:text-yellow-400 hover:border-yellow-500/40 hover:bg-yellow-500/5',
  },
  {
    id: 'amazon_sde',
    label: 'Amazon SDE',
    emoji: '🟠',
    description: 'Amazon-tagged problems',
    companies: ['Amazon'],
    color: 'data-[active=true]:border-orange-500/60 data-[active=true]:bg-orange-500/10 data-[active=true]:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5',
  },
  {
    id: 'google_focus',
    label: 'Google Focus',
    emoji: '🔵',
    description: 'Google-tagged problems',
    companies: ['Google'],
    color: 'data-[active=true]:border-blue-500/60 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/5',
  },
  {
    id: 'meta_focus',
    label: 'Meta Focus',
    emoji: '🔷',
    description: 'Meta-tagged problems',
    companies: ['Meta'],
    color: 'data-[active=true]:border-sky-500/60 data-[active=true]:bg-sky-500/10 data-[active=true]:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/5',
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    emoji: '🟩',
    description: 'Microsoft-tagged problems',
    companies: ['Microsoft'],
    color: 'data-[active=true]:border-green-500/60 data-[active=true]:bg-green-500/10 data-[active=true]:text-green-400 hover:border-green-500/40 hover:bg-green-500/5',
  },
  {
    id: 'startup',
    label: 'Startup Tier',
    emoji: '🚀',
    description: 'Uber · Adobe · Flipkart · Swiggy',
    companies: ['Uber', 'Adobe', 'Flipkart', 'Swiggy'],
    color: 'data-[active=true]:border-purple-500/60 data-[active=true]:bg-purple-500/10 data-[active=true]:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/5',
  },
  {
    id: 'all',
    label: 'All Problems',
    emoji: '📋',
    description: 'Your full problem list',
    companies: [],
    color: 'data-[active=true]:border-primary/60 data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:border-primary/40 hover:bg-primary/5',
  },
];

const STORAGE_KEY = 'algonix_problems_filters';

// Read saved filter state from localStorage
function loadSavedFilters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Default filter state — FAANG sheet active by default
const DEFAULT_FILTERS = {
  activeSheet: 'faang',
  search: '',
  filterDifficulty: 'all',
  filterStatus: 'all',
  filterPlatform: 'all',
  filterSheet: 'all',
  filterTopics: [],
  filterPatterns: [],
};

export default function Problems() {
  const saved = loadSavedFilters();

  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'tracking'

  // Filter state — restored from localStorage or defaults
  const [activeSheet, setActiveSheetState]     = useState(saved?.activeSheet     ?? DEFAULT_FILTERS.activeSheet);
  const [search, setSearchState]               = useState(saved?.search          ?? DEFAULT_FILTERS.search);
  const [filterDifficulty, setDiffState]       = useState(saved?.filterDifficulty ?? DEFAULT_FILTERS.filterDifficulty);
  const [filterStatus, setStatusState]         = useState(saved?.filterStatus    ?? DEFAULT_FILTERS.filterStatus);
  const [filterPlatform, setPlatformState]     = useState(saved?.filterPlatform  ?? DEFAULT_FILTERS.filterPlatform);
  const [filterSheet, setSheetState]           = useState(saved?.filterSheet     ?? DEFAULT_FILTERS.filterSheet);
  const [filterTopics, setTopicsState]         = useState(saved?.filterTopics    ?? DEFAULT_FILTERS.filterTopics);
  const [filterPatterns, setPatternsState]     = useState(saved?.filterPatterns  ?? DEFAULT_FILTERS.filterPatterns);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.userId;
  console.log('[Problems] user:', user, '| userId:', userId);

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: getProblems,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createProblem(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const updateMetaMutation = useMutation({
    mutationFn: ({ id, data }) => updateProblemMeta(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const updateTrackingMutation = useMutation({
    mutationFn: ({ id, data }) => updateProblemTracking(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProblem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });
  const persist = useCallback((patch) => {
    const current = loadSavedFilters() ?? DEFAULT_FILTERS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  }, []);

  // Wrapped setters that also persist
  const setActiveSheet    = (v) => { setActiveSheetState(v);   persist({ activeSheet: v }); };
  const setSearch         = (v) => { setSearchState(v);        persist({ search: v }); };
  const setFilterDiff     = (v) => { setDiffState(v);          persist({ filterDifficulty: v }); };
  const setFilterStatus   = (v) => { setStatusState(v);        persist({ filterStatus: v }); };
  const setFilterPlatform = (v) => { setPlatformState(v);      persist({ filterPlatform: v }); };
  const setFilterSheet    = (v) => { setSheetState(v);         persist({ filterSheet: v }); };
  const setFilterTopics   = (v) => { setTopicsState(v);        persist({ filterTopics: v }); };
  const setFilterPatterns = (v) => { setPatternsState(v);      persist({ filterPatterns: v }); };

  // All companies from imported problems
  const allCompanies = useMemo(() => {
    const set = new Set();
    problems.forEach(p => (p.companies || []).forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [problems]);

  // Current curated sheet object
  const currentSheet = CURATED_SHEETS.find(s => s.id === activeSheet) ?? CURATED_SHEETS[0];

  // Per-sheet problem counts for the tab badges
  const sheetCounts = useMemo(() => {
    const counts = {};
    CURATED_SHEETS.forEach(sheet => {
      if (sheet.companies.length === 0) {
        counts[sheet.id] = { total: problems.length, solved: problems.filter(p => p.status === 'solved').length };
        return;
      }
      const matching = problems.filter(p =>
        (p.companies || []).some(c =>
          sheet.companies.some(sc => sc.toLowerCase() === c.toLowerCase())
        )
      );
      counts[sheet.id] = {
        total: matching.length,
        solved: matching.filter(p => p.status === 'solved').length,
      };
    });
    return counts;
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // Sheet filter — match any of the sheet's companies
      const matchSheetCompanies = currentSheet.companies.length === 0 ||
        (p.companies || []).some(c =>
          currentSheet.companies.some(sc => sc.toLowerCase() === c.toLowerCase())
        );

      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchDiff     = filterDifficulty === 'all' || p.difficulty === filterDifficulty;
      const matchStatus   = filterStatus     === 'all' || p.status     === filterStatus;
      const matchPlatform = filterPlatform   === 'all' || p.platform   === filterPlatform;
      const matchSheet    = filterSheet      === 'all' || p.sheet      === filterSheet;
      const matchPattern  = filterPatterns.length === 0 ||
        filterPatterns.every(pat =>
          (p.tags || []).some(t => t.toLowerCase() === pat.toLowerCase()) ||
          (p.patterns || []).some(pt => pt.toLowerCase() === pat.toLowerCase())
        );
      const matchTopic    = filterTopics.length === 0 ||
        filterTopics.every(topic =>
          (p.tags || []).some(t => t.toLowerCase() === topic.toLowerCase())
        );

      return matchSheetCompanies && matchSearch && matchDiff && matchStatus &&
             matchPlatform && matchSheet && matchPattern && matchTopic;
    });
  }, [problems, currentSheet, search, filterDifficulty, filterStatus, filterPlatform, filterSheet, filterPatterns, filterTopics]);

  const handleSubmit = (data) => {
    if (formMode === 'tracking' && editingProblem) {
      updateTrackingMutation.mutate({ id: editingProblem.id, data });
    } else if (formMode === 'create' && editingProblem) {
      updateMetaMutation.mutate({ id: editingProblem.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingProblem(null);
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setFormMode('create');   // edit metadata
    setShowForm(true);
  };

  const handleUpdateTracking = (problem) => {
    setEditingProblem(problem);
    setFormMode('tracking'); // edit user progress
    setShowForm(true);
  };

  const handleStatusChange = (problemId, newStatus) => {
    return updateTrackingMutation.mutateAsync({
      id: problemId,
      data: {
        ...(problems.find(p => p.id === problemId) || {}),
        status: newStatus,
        solvedDate: newStatus === 'solved' ? new Date().toISOString().split('T')[0] : null,
      },
    });
  };

  const additionalFilterCount = [
    filterDifficulty !== 'all',
    filterStatus !== 'all',
    filterPlatform !== 'all',
    filterSheet !== 'all',
    filterTopics.length > 0,
    filterPatterns.length > 0,
  ].filter(Boolean).length;

  const clearAdditionalFilters = () => {
    setSearch('');
    setFilterDiff('all');
    setFilterStatus('all');
    setFilterPlatform('all');
    setFilterSheet('all');
    setFilterTopics([]);
    setFilterPatterns([]);
  };

  const counts = sheetCounts[activeSheet] ?? { total: 0, solved: 0 };

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProblems.length !== counts.total
              ? `${filteredProblems.length} of ${counts.total} · `
              : `${counts.total} problems · `}
            {counts.solved} solved
            {additionalFilterCount > 0 && (
              <button onClick={clearAdditionalFilters} className="ml-2 text-primary hover:underline">
                Clear filters
              </button>
            )}
          </p>
        </div>
        <Button onClick={() => { setEditingProblem(null); setFormMode('create'); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Problem
        </Button>
      </div>

      {/* ── Curated sheet tabs ── */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3 h-3" /> Focus sheet
        </p>
        <div className="flex gap-2 flex-wrap">
          {CURATED_SHEETS.map(sheet => {
            const sc = sheetCounts[sheet.id] ?? { total: 0, solved: 0 };
            const isActive = activeSheet === sheet.id;
            // Grey out sheets with no matching problems (except "All Problems")
            const isEmpty = sheet.id !== 'all' && sc.total === 0;
            if (isEmpty) return null;
            return (
              <button
                key={sheet.id}
                data-active={isActive}
                onClick={() => setActiveSheet(sheet.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium transition-all duration-150',
                  sheet.color,
                  isActive ? 'shadow-sm' : 'text-muted-foreground'
                )}
              >
                <span>{sheet.emoji}</span>
                <span>{sheet.label}</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                  isActive ? 'bg-current/10' : 'bg-muted text-muted-foreground'
                )}>
                  {sc.total - sc.solved}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active sheet description + progress */}
        <div className="flex items-center gap-3 pt-1">
          <p className="text-xs text-muted-foreground">{currentSheet.description}</p>
          {counts.total > 0 && (
            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((counts.solved / counts.total) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                {Math.round((counts.solved / counts.total) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter row ── */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..." className="pl-9" />
        </div>

        <Select value={filterDifficulty} onValueChange={setFilterDiff}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Difficulty</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="attempted">Attempted</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="revisit">Revisit</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-32 hidden md:flex"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Platforms</SelectItem>
            <SelectItem value="leetcode">LeetCode</SelectItem>
            <SelectItem value="codeforces">Codeforces</SelectItem>
            <SelectItem value="codechef">CodeChef</SelectItem>
            <SelectItem value="geeksforgeeks">GFG</SelectItem>
            <SelectItem value="hackerrank">HackerRank</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSheet} onValueChange={setFilterSheet}>
          <SelectTrigger className="w-32 hidden lg:flex"><SelectValue placeholder="Sheet" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sheets</SelectItem>
            <SelectItem value="blind75">Blind 75</SelectItem>
            <SelectItem value="striver_sde">Striver SDE</SelectItem>
            <SelectItem value="neetcode150">NeetCode 150</SelectItem>
            <SelectItem value="grind75">Grind 75</SelectItem>
          </SelectContent>
        </Select>

        {/* Individual company override — still available in the dropdown */}
        <Select
          value="all"
          onValueChange={(c) => {
            // Switching to a specific company flips to "All Problems" sheet
            // so the company filter isn't hidden by a sheet restriction
            setActiveSheet('all');
          }}
        >
          <SelectTrigger className="w-36 hidden md:flex"><SelectValue placeholder="Company" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Companies</SelectItem>
            {allCompanies.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TopicFilter selected={filterTopics} onChange={v => { setFilterTopics(v); setFilterPatterns([]); }} label="Topic" />
        <PatternFilter selected={filterPatterns} onChange={setFilterPatterns} selectedTopics={filterTopics} />
      </div>

      {/* ── Active topic/pattern chips ── */}
      {(filterTopics.length > 0 || filterPatterns.length > 0) && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {filterTopics.length > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Topics:</span>
              {filterTopics.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 font-medium">
                  {t}
                  <button onClick={() => setFilterTopics(prev => prev.filter(x => x !== t))} className="hover:text-destructive transition-colors">×</button>
                </span>
              ))}
            </>
          )}
          {filterPatterns.length > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Patterns:</span>
              {filterPatterns.map(p => (
                <span key={p} className="flex items-center gap-1 px-2.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full border border-accent/20 font-medium">
                  {p}
                  <button onClick={() => setFilterPatterns(prev => prev.filter(x => x !== p))} className="hover:text-destructive transition-colors">×</button>
                </span>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <ProblemTable
          problems={filteredProblems}
          onEdit={handleEdit}
          onUpdateTracking={handleUpdateTracking}
          onDelete={(id) => deleteMutation.mutate(id)}
          onStatusChange={handleStatusChange}
        />
      )}

      <ProblemFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmit}
        initialData={editingProblem}
        mode={formMode}
      />
    </div>
  );
}
