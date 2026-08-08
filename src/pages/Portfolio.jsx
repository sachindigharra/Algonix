import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Code2, Trophy, Flame, GitBranch, ExternalLink, Copy,
  CheckCircle2, Pencil, Loader2, RefreshCw, Plus, Trash2, TrendingUp
} from 'lucide-react';
import { format, subDays, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { fetchPlatformStats, PLATFORM_META, MANUAL_FIELDS } from '@/lib/platformFetcher';

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', avatar_file: null, avatar_preview: '' });
  const [uploading, setUploading] = useState(false);
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [platformForm, setPlatformForm] = useState({
    platform: 'leetcode', profile_url: '', manualData: {}
  });
  const [fetchingStats, setFetchingStats] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const { data: userProfile = {} } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      if (!user?.id) return {};
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || {};
    },
    enabled: !!user?.id,
  });

  const { data: problems = [] } = useQuery({
    queryKey: ['problems', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('problems').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['platform-profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('platform_profiles').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: contests = [] } = useQuery({
    queryKey: ['contests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('contests').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // ── Add platform ────────────────────────────────────────────────────────────
  const addPlatformMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!platformForm.profile_url) throw new Error('Profile URL is required');
      setFetchingStats(true);
      try {
        const stats = await fetchPlatformStats(
          platformForm.platform, platformForm.profile_url, platformForm.manualData
        );
        const { error } = await supabase.from('platform_profiles').insert({
          user_id: user.id,
          platform: platformForm.platform,
          username: stats.username,
          rating: stats.rating,
          max_rating: stats.max_rating,
          rank_title: stats.rank_title,
          problems_solved: stats.problems_solved,
          easy_solved: stats.easy_solved,
          medium_solved: stats.medium_solved,
          hard_solved: stats.hard_solved,
          acceptance_rate: stats.acceptance_rate,
          profile_url: platformForm.profile_url,
          last_synced: stats.last_synced,
        });
        if (error) throw error;
      } finally {
        setFetchingStats(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-profiles'] });
      setPlatformForm({ platform: 'leetcode', profile_url: '', manualData: {} });
      setPlatformDialogOpen(false);
      toast.success('Platform connected!');
    },
    onError: (e) => toast.error(e.message || 'Failed to add platform'),
  });

  // ── Refresh a single platform's stats ───────────────────────────────────────
  const refreshPlatformMutation = useMutation({
    mutationFn: async (profile) => {
      setSyncingId(profile.id);
      try {
        const stats = await fetchPlatformStats(profile.platform, profile.profile_url, {});
        const { error } = await supabase.from('platform_profiles').update({
          rating: stats.rating,
          max_rating: stats.max_rating,
          rank_title: stats.rank_title,
          problems_solved: stats.problems_solved,
          easy_solved: stats.easy_solved,
          medium_solved: stats.medium_solved,
          hard_solved: stats.hard_solved,
          acceptance_rate: stats.acceptance_rate,
          last_synced: stats.last_synced,
        }).eq('id', profile.id);
        if (error) throw error;
      } finally {
        setSyncingId(null);
      }
    },
    onSuccess: (_, profile) => {
      queryClient.invalidateQueries({ queryKey: ['platform-profiles'] });
      toast.success(`${PLATFORM_META[profile.platform]?.label} stats refreshed!`);
    },
    onError: (e) => {
      setSyncingId(null);
      toast.error(e.message || 'Refresh failed');
    },
  });

  // ── Remove platform ─────────────────────────────────────────────────────────
  const removePlatformMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('platform_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-profiles'] });
      toast.success('Platform removed');
    },
    onError: (e) => toast.error(e.message || 'Failed to remove'),
  });

  // ── Update profile ──────────────────────────────────────────────────────────
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      let avatar_url = userProfile.avatar_url;
      if (editForm.avatar_file) {
        setUploading(true);
        const fileExt = editForm.avatar_file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, editForm.avatar_file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatar_url = publicUrl;
      }
      const { error } = await supabase.from('user_profiles').upsert(
        { user_id: user.id, full_name: editForm.full_name || userProfile.full_name, avatar_url, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setUploading(false); setEditOpen(false);
      toast.success('Profile updated!');
    },
    onError: (e) => { setUploading(false); toast.error(e.message || 'Update failed'); },
  });

  // ── Derived stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const solved = problems.filter(p => p.status === 'solved');
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
    const tagCount = {};
    solved.forEach(p => (p.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    const topTopics = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const dsaScore = solved.filter(p => p.difficulty === 'easy').length * 1
      + solved.filter(p => p.difficulty === 'medium').length * 3
      + solved.filter(p => p.difficulty === 'hard').length * 5;
    const cpScore = contests.filter(c => c.participated).length * 10;
    return {
      total: solved.length,
      easy: solved.filter(p => p.difficulty === 'easy').length,
      medium: solved.filter(p => p.difficulty === 'medium').length,
      hard: solved.filter(p => p.difficulty === 'hard').length,
      streak, topTopics, cScore: dsaScore + cpScore,
      contestsJoined: contests.filter(c => c.participated).length,
    };
  }, [problems, contests]);

  const combinedStats = useMemo(() => {
    const totalSolved = profiles.reduce((s, p) => s + (p.problems_solved || 0), 0);
    const ratedProfiles = profiles.filter(p => p.rating && p.platform !== 'leetcode');
    const avgRating = ratedProfiles.length
      ? Math.round(ratedProfiles.reduce((s, p) => s + p.rating, 0) / ratedProfiles.length) : 0;
    const bestRating = ratedProfiles.length
      ? Math.max(...ratedProfiles.map(p => p.max_rating || p.rating || 0)) : 0;
    return { totalSolved, avgRating, bestRating, totalPlatforms: profiles.length };
  }, [profiles]);

  const openEditDialog = () => {
    setEditForm({ full_name: userProfile.full_name || '', avatar_file: null, avatar_preview: userProfile.avatar_url || '' });
    setEditOpen(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Portfolio link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const meta = PLATFORM_META[platformForm.platform] || {};
  const manualFields = MANUAL_FIELDS[platformForm.platform] || [];
  const needsManual = manualFields.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Your developer profile & platform stats</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={openEditDialog}>
            <Pencil className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPlatformDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Platform
          </Button>
          <Button variant="outline" size="sm" onClick={copyLink}>
            {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {userProfile.avatar_url ? (
            <img src={userProfile.avatar_url} alt="avatar" className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
              {(userProfile.full_name || '')?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userProfile.full_name || 'Developer'}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {stats.topTopics.map(([topic]) => (
                <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 text-center bg-primary/5 border border-primary/20 rounded-xl px-6 py-4">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">C-Score</p>
            <p className="text-3xl font-bold text-primary">{stats.cScore}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Easy×1 · Med×3 · Hard×5</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Code2, value: stats.total, label: 'Problems Solved', color: 'text-primary' },
          { icon: Flame, value: `${stats.streak}d`, label: 'Streak', color: 'text-warning' },
          { icon: Trophy, value: stats.contestsJoined, label: 'Contests', color: 'text-accent' },
          { icon: GitBranch, value: profiles.length, label: 'Platforms', color: 'text-muted-foreground' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-5 text-center">
            <Icon className={cn('w-5 h-5 mx-auto mb-2', color)} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Difficulty breakdown */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Difficulty Breakdown</h3>
        <div className="flex gap-4">
          {[
            { label: 'Easy', count: stats.easy, color: 'text-success', bar: 'bg-success' },
            { label: 'Medium', count: stats.medium, color: 'text-warning', bar: 'bg-warning' },
            { label: 'Hard', count: stats.hard, color: 'text-destructive', bar: 'bg-destructive' },
          ].map(d => (
            <div key={d.label} className="flex-1 text-center">
              <p className={cn('text-xl font-bold', d.color)}>{d.count}</p>
              <div className={cn('h-1 rounded-full mt-1 opacity-30', d.bar)} />
              <p className="text-xs text-muted-foreground mt-1">{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connected platforms */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Connected Platforms</h3>
          {profiles.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span><span className="font-semibold text-foreground">{combinedStats.totalSolved}</span> combined solved</span>
              {combinedStats.bestRating > 0 && (
                <span><span className="font-semibold text-foreground">{combinedStats.bestRating}</span> peak rating</span>
              )}
            </div>
          )}
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <GitBranch className="w-8 h-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No platforms connected yet.</p>
            <Button variant="outline" size="sm" onClick={() => setPlatformDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add your first platform
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map(profile => {
              const pm = PLATFORM_META[profile.platform] || {};
              const isSyncing = syncingId === profile.id;
              return (
                <div key={profile.id} className="border border-border rounded-xl p-4 group hover:border-primary/40 transition-all">
                  {/* Platform header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{pm.icon || '📝'}</span>
                      <div>
                        <p className="text-sm font-semibold">{pm.label || profile.platform}</p>
                        <p className="text-xs text-muted-foreground">@{profile.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {pm.hasLiveSync && (
                        <button
                          onClick={() => refreshPlatformMutation.mutate(profile)}
                          disabled={isSyncing}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          title="Refresh stats"
                        >
                          <RefreshCw className={cn('w-3.5 h-3.5 text-muted-foreground hover:text-primary', isSyncing && 'animate-spin')} />
                        </button>
                      )}
                      {profile.profile_url && (
                        <a href={profile.profile_url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-muted transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                      <button
                        onClick={() => removePlatformMutation.mutate(profile.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="space-y-2">
                    {/* Problems solved */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Problems Solved</span>
                      <span className="font-semibold">{profile.problems_solved ?? 0}</span>
                    </div>

                    {/* Easy/Medium/Hard breakdown if available */}
                    {(profile.easy_solved > 0 || profile.medium_solved > 0 || profile.hard_solved > 0) && (
                      <div className="flex gap-1.5 text-[10px]">
                        <span className="flex-1 text-center py-1 bg-success/10 text-success rounded font-semibold">
                          {profile.easy_solved ?? 0} Easy
                        </span>
                        <span className="flex-1 text-center py-1 bg-warning/10 text-warning rounded font-semibold">
                          {profile.medium_solved ?? 0} Med
                        </span>
                        <span className="flex-1 text-center py-1 bg-destructive/10 text-destructive rounded font-semibold">
                          {profile.hard_solved ?? 0} Hard
                        </span>
                      </div>
                    )}

                    {/* Rating */}
                    {profile.rating != null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {profile.platform === 'leetcode' ? 'Global Rank' : 'Rating'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">
                            {profile.platform === 'leetcode'
                              ? `#${profile.rating.toLocaleString()}`
                              : profile.rating}
                          </span>
                          {profile.max_rating && profile.platform !== 'leetcode' && (
                            <span className="text-muted-foreground">(peak {profile.max_rating})</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rank title */}
                    {profile.rank_title && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Rank</span>
                        <span className="font-medium capitalize" style={{ color: pm.color }}>{profile.rank_title}</span>
                      </div>
                    )}

                    {/* Acceptance rate */}
                    {profile.acceptance_rate != null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Acceptance Rate</span>
                        <span className="font-semibold">{profile.acceptance_rate}%</span>
                      </div>
                    )}
                  </div>

                  {/* Last synced */}
                  {profile.last_synced && (
                    <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Updated {formatDistanceToNow(new Date(profile.last_synced), { addSuffix: true })}
                      {!pm.hasLiveSync && ' · manual'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your name and avatar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={editForm.full_name}
                onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatar">Profile Picture</Label>
              {editForm.avatar_preview && (
                <img src={editForm.avatar_preview} alt="preview" className="w-20 h-20 rounded-xl object-cover" />
              )}
              <input id="avatar" type="file" accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setEditForm(prev => ({ ...prev, avatar_file: file, avatar_preview: URL.createObjectURL(file) }));
                }}
                className="text-sm" />
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
            <Button onClick={() => updateProfileMutation.mutate()}
              disabled={uploading || updateProfileMutation.isPending} className="w-full">
              {uploading || updateProfileMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Platform Dialog */}
      <Dialog open={platformDialogOpen} onOpenChange={v => { setPlatformDialogOpen(v); if (!v) setPlatformForm({ platform: 'leetcode', profile_url: '', manualData: {} }); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connect a Platform</DialogTitle>
            <DialogDescription>Track your stats across coding platforms</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Platform picker */}
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(PLATFORM_META).map(([key, pm]) => (
                  <button key={key} type="button"
                    onClick={() => setPlatformForm(prev => ({ ...prev, platform: key, manualData: {} }))}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all',
                      platformForm.platform === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/40 hover:bg-muted text-muted-foreground'
                    )}>
                    <span className="text-xl">{pm.icon}</span>
                    <span>{pm.label}</span>
                    {pm.hasLiveSync
                      ? <span className="text-[9px] text-success font-semibold">AUTO SYNC</span>
                      : <span className="text-[9px] text-muted-foreground">MANUAL</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile URL */}
            <div className="space-y-1.5">
              <Label>Profile URL</Label>
              <Input value={platformForm.profile_url}
                onChange={e => setPlatformForm(prev => ({ ...prev, profile_url: e.target.value }))}
                placeholder={meta.urlPattern || 'https://...'} />
              <p className="text-xs text-muted-foreground">e.g. {meta.urlPattern}</p>
            </div>

            {/* Manual fields for platforms without API */}
            {needsManual && (
              <div className="space-y-3 p-3 bg-muted/40 rounded-lg border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Enter your stats manually
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {manualFields.map(field => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs">{field.label}</Label>
                      <Input type={field.type} placeholder="0"
                        value={platformForm.manualData[field.key] || ''}
                        onChange={e => setPlatformForm(prev => ({
                          ...prev,
                          manualData: { ...prev.manualData, [field.key]: Number(e.target.value) }
                        }))}
                        className="h-8 text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => addPlatformMutation.mutate()}
              disabled={addPlatformMutation.isPending || fetchingStats} className="w-full">
              {addPlatformMutation.isPending || fetchingStats
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{fetchingStats ? 'Fetching stats...' : 'Connecting...'}</>
                : <><Plus className="w-4 h-4 mr-2" />Connect {meta.label}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
