import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const TAG_OPTIONS = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Trees', 'Graphs',
  'Dynamic Programming', 'Greedy', 'Binary Search', 'Two Pointers',
  'Sliding Window', 'Backtracking', 'Recursion', 'Math', 'Bit Manipulation',
  'Heap', 'Trie', 'Sorting', 'Hashing', 'BFS', 'DFS', 'Union Find'
];

export default function ProblemFormDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [form, setForm] = useState(initialData || {
    title: '', platform: 'leetcode', difficulty: 'medium', status: 'solved',
    tags: [], companies: [], notes: '', approach: '', time_complexity: '',
    space_complexity: '', url: '', sheet: 'none',
    solved_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [tagInput, setTagInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onOpenChange(false);
  };

  const addTag = (tag) => {
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput('');
  };

  const addCompany = () => {
    if (companyInput && !form.companies.includes(companyInput)) {
      setForm({ ...form, companies: [...form.companies, companyInput] });
    }
    setCompanyInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Problem' : 'Add Problem'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label>Platform *</Label>
              <Select value={form.platform} onValueChange={v => setForm({ ...form, platform: v })}>
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
            <div>
              <Label>Difficulty *</Label>
              <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solved">Solved</SelectItem>
                  <SelectItem value="attempted">Attempted</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="revisit">Revisit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sheet</Label>
              <Select value={form.sheet} onValueChange={v => setForm({ ...form, sheet: v })}>
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
            <div>
              <Label>URL</Label>
              <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Solved Date</Label>
              <Input type="date" value={form.solved_date} onChange={e => setForm({ ...form, solved_date: e.target.value })} />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter(t => t !== tag) })} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {TAG_OPTIONS.filter(t => !form.tags.includes(t)).slice(0, 12).map(tag => (
                  <button key={tag} type="button" onClick={() => addTag(tag)}
                    className="px-2 py-0.5 text-xs border border-border rounded-full hover:bg-muted transition-colors">
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Companies */}
            <div className="md:col-span-2">
              <Label>Companies</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.companies.map(c => (
                  <span key={c} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
                    {c}
                    <button type="button" onClick={() => setForm({ ...form, companies: form.companies.filter(x => x !== c) })} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={companyInput} onChange={e => setCompanyInput(e.target.value)}
                  placeholder="Add company..." className="flex-1"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } }} />
                <Button type="button" variant="outline" size="sm" onClick={addCompany}>Add</Button>
              </div>
            </div>

            {/* Notes & Approach */}
            <div className="md:col-span-2">
              <Label>Approach</Label>
              <Textarea value={form.approach} onChange={e => setForm({ ...form, approach: e.target.value })}
                placeholder="Describe your approach..." rows={3} />
            </div>
            <div>
              <Label>Time Complexity</Label>
              <Input value={form.time_complexity} onChange={e => setForm({ ...form, time_complexity: e.target.value })} placeholder="O(n)" className="font-mono" />
            </div>
            <div>
              <Label>Space Complexity</Label>
              <Input value={form.space_complexity} onChange={e => setForm({ ...form, space_complexity: e.target.value })} placeholder="O(1)" className="font-mono" />
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any notes or key takeaways..." rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initialData ? 'Update' : 'Add Problem'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}