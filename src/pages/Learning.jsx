import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, CheckCircle2, Clock, RotateCcw, Trash2 } from 'lucide-react';
import { format, addDays, isToday, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Learning() {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState('');

  const queryClient = useQueryClient();
  const { data: logs = [] } = useQuery({
    queryKey: ['learning-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('learning_logs').select('*').order('date', { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('learning_logs').insert({ ...data, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-logs'] });
      setShowForm(false); setContent(''); setTopics([]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase.from('learning_logs').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning-logs'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('learning_logs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning-logs'] }),
  });

  const handleAdd = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const nextRevision = format(addDays(new Date(), 4), 'yyyy-MM-dd');
    createMutation.mutate({ date: today, content, topics, revision_status: 'pending', next_revision_date: nextRevision });
  };

  const markRevised = (log) => {
    const nextDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    updateMutation.mutate({ id: log.id, data: { revision_status: 'revised', next_revision_date: nextDate } });
  };

  const dueForRevision = logs.filter(l => 
    l.revision_status === 'pending' && l.next_revision_date && 
    (isToday(new Date(l.next_revision_date)) || isBefore(new Date(l.next_revision_date), new Date()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Learning Journal</h1>
          <p className="text-sm text-muted-foreground mt-1">Track what you learn daily with spaced repetition</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Log Today
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold">What did you learn today?</h3>
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Learned about graph BFS/DFS traversal..." rows={4} />
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {topics.map(t => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button onClick={() => setTopics(topics.filter(x => x !== t))} className="hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={topicInput} onChange={e => setTopicInput(e.target.value)} placeholder="Add topic..."
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (topicInput) { setTopics([...topics, topicInput]); setTopicInput(''); } } }} />
              <Button type="button" variant="outline" size="sm" onClick={() => { if (topicInput) { setTopics([...topics, topicInput]); setTopicInput(''); } }}>Add</Button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!content}>Save Entry</Button>
          </div>
        </div>
      )}

      {/* Due for Revision */}
      {dueForRevision.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-warning flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Due for Revision ({dueForRevision.length})
          </h2>
          <div className="grid gap-3">
            {dueForRevision.map(log => (
              <div key={log.id} className="bg-card border border-warning/20 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Learned on {format(new Date(log.date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm">{log.content}</p>
                    {log.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {log.topics.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => markRevised(log)} className="flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Revised
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Logs */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Entries</h2>
        {logs.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground text-sm">
            No learning entries yet. Start logging!
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">{format(new Date(log.date), 'EEEE, MMM d')}</span>
                      <Badge variant="secondary" className={cn("text-[10px]",
                        log.revision_status === 'revised' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      )}>
                        {log.revision_status === 'revised' ? 'Revised' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm">{log.content}</p>
                    {log.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {log.topics.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive flex-shrink-0" onClick={() => deleteMutation.mutate(log.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}