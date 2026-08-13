import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPatternsForTopics } from "@/lib/topicPatterns";

const TOPIC_GROUPS = [
  { group: 'Data Structures',  topics: ['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Heap', 'Trie', 'Trees', 'Binary Search Tree', 'Graphs', 'Matrix'] },
  { group: 'Core Algorithms',  topics: ['Binary Search', 'Two Pointers', 'Sliding Window', 'Sorting', 'Hashing', 'Recursion', 'Backtracking'] },
  { group: 'Advanced',         topics: ['Dynamic Programming', 'Greedy', 'Union Find', 'Bit Manipulation', 'Math', 'Intervals'] },
];

// Fields for creating a Problem (metadata)
const defaultProblemState = {
  title: '', platform: 'leetcode', difficulty: 'medium',
  tags: [], patterns: [], companies: [], url: '', visibility: 'private',
};

// Fields for updating a UserProblem (tracking)
const defaultTrackingState = {
  status: 'todo', notes: '', approaches: '',
  timeComplexity: '', spaceComplexity: '',
  sheet: 'none', solvedDate: format(new Date(), 'yyyy-MM-dd'),
};

// mode: 'create' | 'tracking'
export default function ProblemFormDialog({ open, onOpenChange, onSubmit, initialData, mode = 'create' }) {
  const [form, setForm] = useState(mode === 'create' ? defaultProblemState : defaultTrackingState);
  const [topicSearch, setTopicSearch] = useState('');
  const [patternSearch, setPatternSearch] = useState('');
  const [patternInput, setPatternInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');

  useEffect(() => {
    if (!open) return;

    if (mode === 'create' && initialData) {
      // Editing problem metadata
      setForm({
        title:      initialData.title      || '',
        platform:   initialData.platform   || 'leetcode',
        difficulty: initialData.difficulty || 'medium',
        tags:       initialData.tags       || [],
        patterns:   initialData.patterns   || [],
        companies:  initialData.companies  || [],
        url:        initialData.url        || '',
        visibility: initialData.visibility || 'private',
      });
    } else if (mode === 'tracking' && initialData) {
      // Editing user tracking
      setForm({
        status:          initialData.status          || 'todo',
        notes:           initialData.notes           || '',
        approaches:      initialData.approaches      || '',
        timeComplexity:  initialData.timeComplexity  || initialData.time_complexity  || '',
        spaceComplexity: initialData.spaceComplexity || initialData.space_complexity || '',
        sheet:           initialData.sheet           || 'none',
        solvedDate:      initialData.solvedDate      || initialData.solved_date || format(new Date(), 'yyyy-MM-dd'),
      });
    } else {
      // New problem
      setForm(mode === 'create' ? defaultProblemState : defaultTrackingState);
      setTopicSearch('');
      setPatternSearch('');
      setPatternInput('');
    }
  }, [open, initialData, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onOpenChange(false);
  };

  const toggleTopic = (topic) => {
    const newTags = form.tags.includes(topic)
      ? form.tags.filter(t => t !== topic)
      : [...form.tags, topic];
    const availablePatterns = getPatternsForTopics(newTags);
    setForm(prev => ({
      ...prev,
      tags: newTags,
      patterns: prev.patterns.filter(p => availablePatterns.includes(p)),
    }));
  };

  const togglePattern = (pattern) => {
    setForm(prev => ({
      ...prev,
      patterns: prev.patterns.includes(pattern)
        ? prev.patterns.filter(p => p !== pattern)
        : [...prev.patterns, pattern],
    }));
  };

  const addCustomPattern = () => {
    const trimmed = patternInput.trim();
    if (trimmed && !form.patterns.includes(trimmed)) {
      setForm(prev => ({ ...prev, patterns: [...prev.patterns, trimmed] }));
    }
    setPatternInput('');
  };

  const addCompany = () => {
    const trimmed = companyInput.trim();
    if (trimmed && !form.companies.includes(trimmed)) {
      setForm(prev => ({ ...prev, companies: [...prev.companies, trimmed] }));
    }
    setCompanyInput('');
  };

  const availablePatterns = getPatternsForTopics(form.tags || []);
  const filteredTopicGroups = topicSearch.trim()
    ? [{ group: 'Results', topics: TOPIC_GROUPS.flatMap(g => g.topics).filter(t => t.toLowerCase().includes(topicSearch.toLowerCase())) }]
    : TOPIC_GROUPS;
  const filteredPatterns = patternSearch.trim()
    ? availablePatterns.filter(p => p.toLowerCase().includes(patternSearch.toLowerCase()))
    : availablePatterns;

  const isCreate   = mode === 'create';
  const isTracking = mode === 'tracking';
  const title      = isCreate
    ? (initialData ? 'Edit Problem' : 'Add Problem')
    : 'Update Progress';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {isTracking && initialData?.title && (
            <p className="text-sm text-muted-foreground mt-1">{initialData.title}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ── PROBLEM METADATA fields (create/edit) ── */}
            {isCreate && (
              <>
                {/* Title */}
                <div className="md:col-span-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>

                {/* Platform */}
                <div>
                  <Label>Platform *</Label>
                  <Select value={form.platform} onValueChange={v => setForm(p => ({ ...p, platform: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leetcode">LeetCode</SelectItem>
                      <SelectItem value="codeforces">Codeforces</SelectItem>
                      <SelectItem value="codechef">CodeChef</SelectItem>
                      <SelectItem value="geeksforgeeks">GeeksforGeeks</SelectItem>
                      <SelectItem value="hackerrank">HackerRank</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <Label>Difficulty *</Label>
                  <Select value={form.difficulty} onValueChange={v => setForm(p => ({ ...p, difficulty: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibility */}
                <div>
                  <Label>Visibility</Label>
                  <Select value={form.visibility} onValueChange={v => setForm(p => ({ ...p, visibility: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* URL */}
                <div>
                  <Label>URL</Label>
                  <Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." />
                </div>

                {/* Topics */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Topics</Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">DSA concepts this problem belongs to</p>
                    </div>
                    {form.tags.length > 0 && (
                      <button type="button" onClick={() => setForm(p => ({ ...p, tags: [], patterns: [] }))}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                          {tag}
                          <button type="button" onClick={() => toggleTopic(tag)} className="hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={topicSearch} onChange={e => setTopicSearch(e.target.value)} placeholder="Search topics..." className="pl-8 h-8 text-xs" />
                  </div>
                  <div className="border border-border rounded-lg p-3 space-y-3 max-h-44 overflow-y-auto scrollbar-thin">
                    {filteredTopicGroups.map(group => (
                      <div key={group.group}>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{group.group}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.topics.map(topic => {
                            const selected = form.tags.includes(topic);
                            return (
                              <button key={topic} type="button" onClick={() => toggleTopic(topic)}
                                className={cn('px-2.5 py-1 text-xs rounded-full border transition-all font-medium',
                                  selected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                    : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-primary/5'
                                )}>
                                {topic}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patterns */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Patterns</Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Solving techniques — {form.tags.length > 0 ? `filtered for: ${form.tags.join(', ')}` : 'select a topic above to filter'}
                      </p>
                    </div>
                    {form.patterns.length > 0 && (
                      <button type="button" onClick={() => setForm(p => ({ ...p, patterns: [] }))}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>
                  {form.patterns.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.patterns.map(pat => (
                        <span key={pat} className="flex items-center gap-1 px-2.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full border border-accent/20 font-medium">
                          {pat}
                          <button type="button" onClick={() => togglePattern(pat)} className="hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={patternSearch} onChange={e => setPatternSearch(e.target.value)} placeholder="Search patterns..." className="pl-8 h-8 text-xs" />
                  </div>
                  <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto scrollbar-thin">
                    {availablePatterns.length === 0
                      ? <p className="text-xs text-muted-foreground text-center py-3">Select a topic above to see its patterns</p>
                      : filteredPatterns.length === 0
                      ? <p className="text-xs text-muted-foreground text-center py-3">No patterns match "{patternSearch}"</p>
                      : (
                        <div className="flex flex-wrap gap-1.5">
                          {filteredPatterns.map(pattern => {
                            const selected = form.patterns.includes(pattern);
                            return (
                              <button key={pattern} type="button" onClick={() => togglePattern(pattern)}
                                className={cn('px-2.5 py-1 text-xs rounded-full border transition-all font-medium',
                                  selected
                                    ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                                    : 'bg-background text-muted-foreground border-border hover:border-accent/50 hover:text-foreground hover:bg-accent/5'
                                )}>
                                {pattern}
                              </button>
                            );
                          })}
                        </div>
                      )
                    }
                  </div>
                  <div className="flex gap-2">
                    <Input value={patternInput} onChange={e => setPatternInput(e.target.value)}
                      placeholder="Add custom pattern..." className="flex-1 h-8 text-xs"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomPattern(); } }} />
                    <Button type="button" variant="outline" size="sm" onClick={addCustomPattern} className="h-8 text-xs px-3">Add</Button>
                  </div>
                </div>

                {/* Companies */}
                <div className="md:col-span-2">
                  <Label>Companies</Label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.companies.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full flex items-center gap-1 border border-border">
                        {c}
                        <button type="button" onClick={() => setForm(p => ({ ...p, companies: p.companies.filter(x => x !== c) }))} className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={companyInput} onChange={e => setCompanyInput(e.target.value)} placeholder="Add company..." className="flex-1"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } }} />
                    <Button type="button" variant="outline" size="sm" onClick={addCompany}>Add</Button>
                  </div>
                </div>
              </>
            )}

            {/* ── USER TRACKING fields (tracking mode) ── */}
            {isTracking && (
              <>
                {/* Status */}
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="attempted">Attempted</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="revisit">Revisit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sheet */}
                <div>
                  <Label>Sheet</Label>
                  <Select value={form.sheet} onValueChange={v => setForm(p => ({ ...p, sheet: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="blind75">Blind 75</SelectItem>
                      <SelectItem value="striver_sde">Striver SDE</SelectItem>
                      <SelectItem value="neetcode150">NeetCode 150</SelectItem>
                      <SelectItem value="grind75">Grind 75</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Solved Date */}
                <div className="md:col-span-2">
                  <Label>Solved Date</Label>
                  <Input type="date" value={form.solvedDate} onChange={e => setForm(p => ({ ...p, solvedDate: e.target.value }))} />
                </div>

                {/* Approaches */}
                <div className="md:col-span-2">
                  <Label>Approaches</Label>
                  <Textarea value={form.approaches} onChange={e => setForm(p => ({ ...p, approaches: e.target.value }))} placeholder="Describe your approach..." rows={3} />
                </div>

                {/* Complexity */}
                <div>
                  <Label>Time Complexity</Label>
                  <Input value={form.timeComplexity} onChange={e => setForm(p => ({ ...p, timeComplexity: e.target.value }))} placeholder="O(n)" className="font-mono" />
                </div>
                <div>
                  <Label>Space Complexity</Label>
                  <Input value={form.spaceComplexity} onChange={e => setForm(p => ({ ...p, spaceComplexity: e.target.value }))} placeholder="O(1)" className="font-mono" />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Key takeaways, edge cases..." rows={2} />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">
              {isTracking ? 'Save Progress' : (initialData ? 'Update' : 'Add Problem')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
