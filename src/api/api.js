/**
 * Backend Toggle
 * --------------
 * VITE_USE_SPRING_BACKEND=true  → calls go to Spring Boot (localhost:8080)
 * VITE_USE_SPRING_BACKEND=false → calls go to Supabase (default)
 *
 * To switch: edit .env, save, restart dev server (npm run dev)
 */

import { supabase } from '@/lib/supabase';

export const USE_SPRING = import.meta.env.VITE_USE_SPRING_BACKEND === 'true';
const SPRING_URL = import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080/api';


// ─── Spring Boot HTTP helper ───────────────────────────────────────────────

async function springRequest(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${SPRING_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Request failed: ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── Problems ─────────────────────────────────────────────────────────────

export const problemsApi = {

  getAll: async (userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return springRequest('/problems');
  },

  create: async (problem, userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('problems')
        .insert({ ...problem, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return springRequest('/problems', { method: 'POST', body: JSON.stringify(problem) });
  },

  update: async (id, updates, userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('problems')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return springRequest(`/problems/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },

  delete: async (id, userId) => {
    if (!USE_SPRING) {
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return null;
    }
    return springRequest(`/problems/${id}`, { method: 'DELETE' });
  },

  bulkImport: async (problems, userId) => {
    if (!USE_SPRING) {
      const payload = problems.map(p => ({ ...p, user_id: userId }));
      const BATCH = 100;
      for (let i = 0; i < payload.length; i += BATCH) {
        const chunk = payload.slice(i, i + BATCH);
        const { error } = await supabase
          .from('problems')
          .upsert(chunk, { onConflict: ['user_id', 'title'] });
        if (error) throw error;
      }
      return { count: payload.length };
    }
    return springRequest('/problems/bulk', {
      method: 'POST',
      body: JSON.stringify(problems),
    });
  },
};

// ─── Contests ─────────────────────────────────────────────────────────────

export const contestsApi = {

  getAll: async (userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return springRequest('/contests');
  },

  create: async (contest, userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('contests')
        .insert({ ...contest, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return springRequest('/contests', { method: 'POST', body: JSON.stringify(contest) });
  },

  update: async (id, updates, userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('contests')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return springRequest(`/contests/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },

  delete: async (id, userId) => {
    if (!USE_SPRING) {
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return null;
    }
    return springRequest(`/contests/${id}`, { method: 'DELETE' });
  },
};

// ─── Learning Logs ────────────────────────────────────────────────────────

export const logsApi = {

  getAll: async (userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('learning_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return springRequest('/learning-logs');
  },

  create: async (log, userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('learning_logs')
        .insert({ ...log, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return springRequest('/learning-logs', { method: 'POST', body: JSON.stringify(log) });
  },

  delete: async (id, userId) => {
    if (!USE_SPRING) {
      const { error } = await supabase
        .from('learning_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return null;
    }
    return springRequest(`/learning-logs/${id}`, { method: 'DELETE' });
  },
};

// ─── Platform Profiles ────────────────────────────────────────────────────

export const profilesApi = {

  getAll: async (userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('platform_profiles')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    }
    return springRequest('/platform-profiles');
  },

  upsert: async (profile, userId) => {
    if (!USE_SPRING) {
      const { data, error } = await supabase
        .from('platform_profiles')
        .upsert({ ...profile, user_id: userId }, { onConflict: ['user_id', 'platform'] })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return springRequest('/platform-profiles', { method: 'POST', body: JSON.stringify(profile) });
  },
};
