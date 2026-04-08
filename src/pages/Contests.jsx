import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trophy, Clock, TrendingUp, TrendingDown, Calendar, Trash2, Pencil } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';

const platformLabels = {
  leetcode: 'LeetCode', codeforces: 'Codeforces', codechef: 'CodeChef', atcoder: 'AtCoder', other: 'Other'
};

export default function Contests() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', platform: 'leetcode', start_time: '', duration_minutes: 120, url: '', participated: false, rank: '', problems_solved: '', rating_change: '', notes: '' });

  const queryClient = useQueryClient();
  const { data: contests = [], isLoading } = useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contests').select('*').order('start_time', { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('contests').insert({ ...data, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contests'] }); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase.from('contests').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contests'] }); setShowForm(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('contests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contests'] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, rank: form.rank ? Number(form.rank) : undefined, problems_solved: form.problems_solved ? Number(form.problems_solved) : undefined, rating_change: form.rating_change ? Number(form.rating_change) : undefined };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
    setEditing(null);
  };

  const openEdit = (contest) => {
    setEditing(contest);
    setForm({ ...contest, rank: contest.rank || '', problems_solved: contest.problems_solved || '', rating_change: contest.rating_change || '' });
    setShowForm(true);
  };

  const upcoming = contests.filter(c => c.start_time && isFuture(new Date(c.start_time)));
  const past = contests.filter(c => !c.start_time || isPast(new Date(c.start_time)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contests</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your competitive programming journey</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', platform: 'leetcode', start_time: '', duration_minutes: 120, url: '', participated: false, rank: '', problems_solved: '', rating_change: '', notes: '' }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Contest
        </Button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upcoming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map(contest => (
              <div key={contest.id} className="bg-card border border-primary/20 rounded-xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="text-[10px] mb-2">{platformLabels[contest.platform]}</Badge>
                    <h3 className="font-semibold text-sm">{contest.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(contest.start_time), 'MMM d, h:mm a')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{contest.duration_minutes}m</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(contest)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(contest.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">History</h2>
        {past.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground text-sm">
            No contest history yet.
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Contest</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Platform</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Rank</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Solved</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Rating Δ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {past.map(contest => (
                  <tr key={contest.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{contest.name}</p>
                        <p className="text-xs text-muted-foreground">{contest.start_time ? format(new Date(contest.start_time), 'MMM d, yyyy') : '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">{platformLabels[contest.platform]}</td>
                    <td className="px-4 py-3 hidden md:table-cell font-mono text-sm">{contest.rank || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell font-mono text-sm">{contest.problems_solved ?? '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {contest.rating_change != null ? (
                        <span className={cn("flex items-center gap-1 text-sm font-mono", contest.rating_change >= 0 ? 'text-success' : 'text-destructive')}>
                          {contest.rating_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {contest.rating_change > 0 ? '+' : ''}{contest.rating_change}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(contest)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(contest.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Contest' : 'Add Contest'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Contest Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={v => setForm({ ...form, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leetcode">LeetCode</SelectItem>
                    <SelectItem value="codeforces">Codeforces</SelectItem>
                    <SelectItem value="codechef">CodeChef</SelectItem>
                    <SelectItem value="atcoder">AtCoder</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Start Time</Label>
              <Input type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.participated} onCheckedChange={v => setForm({ ...form, participated: v })} />
              <Label>Participated</Label>
            </div>
            {form.participated && (
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Rank</Label><Input type="number" value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })} /></div>
                <div><Label>Solved</Label><Input type="number" value={form.problems_solved} onChange={e => setForm({ ...form, problems_solved: e.target.value })} /></div>
                <div><Label>Rating Δ</Label><Input type="number" value={form.rating_change} onChange={e => setForm({ ...form, rating_change: e.target.value })} /></div>
              </div>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Add Contest'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}