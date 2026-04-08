import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import ProblemTable from '../components/problems/ProblemTable';
import ProblemFormDialog from '../components/problems/ProblemFormDialog';

export default function Problems() {
  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterSheet, setFilterSheet] = useState('all');

  const queryClient = useQueryClient();

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('problems').insert({ ...data, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase.from('problems').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('problems').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchDiff = filterDifficulty === 'all' || p.difficulty === filterDifficulty;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
      const matchSheet = filterSheet === 'all' || p.sheet === filterSheet;
      return matchSearch && matchDiff && matchStatus && matchPlatform && matchSheet;
    });
  }, [problems, search, filterDifficulty, filterStatus, filterPlatform, filterSheet]);

  const handleSubmit = (data) => {
    if (editingProblem) {
      updateMutation.mutate({ id: editingProblem.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingProblem(null);
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
          <p className="text-sm text-muted-foreground mt-1">{problems.length} total · {problems.filter(p => p.status === 'solved').length} solved</p>
        </div>
        <Button onClick={() => { setEditingProblem(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Problem
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems or tags..." className="pl-9" />
        </div>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulty</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="attempted">Attempted</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="revisit">Revisit</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-32 hidden md:flex"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
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
            <SelectItem value="all">All Sheets</SelectItem>
            <SelectItem value="blind75">Blind 75</SelectItem>
            <SelectItem value="striver_sde">Striver SDE</SelectItem>
            <SelectItem value="neetcode150">NeetCode 150</SelectItem>
            <SelectItem value="grind75">Grind 75</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <ProblemTable problems={filteredProblems} onEdit={handleEdit} onDelete={(id) => deleteMutation.mutate(id)} />
      )}

      <ProblemFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmit}
        initialData={editingProblem}
      />
    </div>
  );
}