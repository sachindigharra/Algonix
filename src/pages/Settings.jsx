import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const platformLabels = {
  leetcode: 'LeetCode', codeforces: 'Codeforces', codechef: 'CodeChef',
  github: 'GitHub', geeksforgeeks: 'GeeksforGeeks', hackerrank: 'HackerRank'
};

export default function Settings() {
  const [user, setUser] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [form, setForm] = useState({ platform: 'leetcode', username: '', profile_url: '', problems_solved: 0, rating: '', max_rating: '', contributions: 0, streak: 0 });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const queryClient = useQueryClient();
  const { data: profiles = [] } = useQuery({
    queryKey: ['platform-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('platform_profiles').select('*');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('platform_profiles').insert({ ...data, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['platform-profiles'] }); setShowProfileForm(false); toast.success('Profile added!'); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase.from('platform_profiles').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['platform-profiles'] }); setShowProfileForm(false); toast.success('Profile updated!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('platform_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['platform-profiles'] }); toast.success('Profile removed'); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, problems_solved: Number(form.problems_solved) || 0, rating: form.rating ? Number(form.rating) : undefined, max_rating: form.max_rating ? Number(form.max_rating) : undefined, contributions: Number(form.contributions) || 0, streak: Number(form.streak) || 0 };
    if (editingProfile) updateMutation.mutate({ id: editingProfile.id, data });
    else createMutation.mutate(data);
  };

  const openEdit = (profile) => {
    setEditingProfile(profile);
    setForm({ ...profile, rating: profile.rating || '', max_rating: profile.max_rating || '' });
    setShowProfileForm(true);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and connected platforms</p>
      </div>

      {/* User Info */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Account</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white">
            {user?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium">{user?.full_name || 'Loading...'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Connected Platforms</h3>
          <Button size="sm" onClick={() => { setEditingProfile(null); setForm({ platform: 'leetcode', username: '', profile_url: '', problems_solved: 0, rating: '', max_rating: '', contributions: 0, streak: 0 }); setShowProfileForm(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Platform
          </Button>
        </div>
        {profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No platforms connected yet.</p>
        ) : (
          <div className="space-y-2">
            {profiles.map(profile => (
              <div key={profile.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{platformLabels[profile.platform]}</p>
                  <p className="text-xs text-muted-foreground">@{profile.username} · {profile.problems_solved || 0} solved{profile.rating ? ` · Rating: ${profile.rating}` : ''}</p>
                </div>
                <div className="flex gap-1">
                  {profile.profile_url && (
                    <a href={profile.profile_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(profile)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(profile.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Form Dialog */}
      <Dialog open={showProfileForm} onOpenChange={setShowProfileForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProfile ? 'Edit Platform' : 'Add Platform'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={v => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(platformLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Username *</Label>
              <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div>
              <Label>Profile URL</Label>
              <Input value={form.profile_url} onChange={e => setForm({ ...form, profile_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Problems Solved</Label><Input type="number" value={form.problems_solved} onChange={e => setForm({ ...form, problems_solved: e.target.value })} /></div>
              <div><Label>Rating</Label><Input type="number" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} /></div>
              <div><Label>Max Rating</Label><Input type="number" value={form.max_rating} onChange={e => setForm({ ...form, max_rating: e.target.value })} /></div>
              <div><Label>Contributions</Label><Input type="number" value={form.contributions} onChange={e => setForm({ ...form, contributions: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowProfileForm(false)}>Cancel</Button>
              <Button type="submit">{editingProfile ? 'Update' : 'Add Platform'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}