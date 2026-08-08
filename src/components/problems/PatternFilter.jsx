import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPatternsForTopics, ALL_PATTERNS } from '@/lib/topicPatterns';

/**
 * PatternFilter — multi-select filter for solving patterns.
 * When topics are selected, only shows patterns relevant to those topics.
 * This teaches the user that patterns live inside topics.
 */
export default function PatternFilter({ selected, onChange, selectedTopics = [] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Context-aware: only show patterns for selected topics
  const availablePatterns = getPatternsForTopics(selectedTopics);

  const filtered = search.trim()
    ? availablePatterns.filter(p => p.toLowerCase().includes(search.toLowerCase()))
    : availablePatterns;

  const toggle = (pattern) => {
    onChange(selected.includes(pattern) ? selected.filter(p => p !== pattern) : [...selected, pattern]);
  };

  const hasActive = selected.length > 0;
  const isContextual = selectedTopics.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-md border text-sm transition-colors bg-background hover:bg-muted',
          hasActive ? 'border-accent text-accent' : 'border-input text-muted-foreground hover:text-foreground'
        )}
      >
        <span className="font-medium">Pattern</span>
        {hasActive && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
            {selected.length}
          </span>
        )}
        {hasActive
          ? <X className="w-3.5 h-3.5 ml-0.5" onClick={e => { e.stopPropagation(); onChange([]); }} />
          : <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
        }
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 right-0 z-50 w-72 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Context hint */}
          {isContextual ? (
            <div className="px-3 py-2 bg-primary/5 border-b border-border flex items-center gap-1.5">
              <Info className="w-3 h-3 text-primary flex-shrink-0" />
              <p className="text-[10px] text-primary">
                Showing patterns for: <span className="font-semibold">{selectedTopics.join(', ')}</span>
              </p>
            </div>
          ) : (
            <div className="px-3 py-2 bg-muted/40 border-b border-border">
              <p className="text-[10px] text-muted-foreground">
                Select a <span className="font-semibold text-foreground">Topic</span> first to see its patterns, or browse all below.
              </p>
            </div>
          )}

          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patterns..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted rounded-md outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Pattern list */}
          <div className="max-h-64 overflow-y-auto scrollbar-thin p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No patterns found</p>
            ) : filtered.map(pattern => {
              const isSelected = selected.includes(pattern);
              return (
                <button
                  key={pattern}
                  type="button"
                  onClick={() => toggle(pattern)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-left transition-colors',
                    isSelected ? 'bg-accent/10 text-accent font-medium' : 'text-foreground hover:bg-muted'
                  )}
                >
                  <span className={cn(
                    'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    isSelected ? 'bg-accent border-accent' : 'border-border'
                  )}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-accent-foreground" />}
                  </span>
                  {pattern}
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div className="p-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{selected.length} selected</span>
              <button type="button" onClick={() => onChange([])} className="text-xs text-destructive hover:underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
