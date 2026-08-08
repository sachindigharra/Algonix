import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_TOPICS } from '@/lib/topicPatterns';

/**
 * TopicFilter — multi-select filter for DSA topics/concepts.
 * (Previously called PatternFilter — renamed to reflect correct terminology.)
 */
export default function TopicFilter({ selected, onChange, label = 'Topic' }) {
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

  const toggle = (item) => {
    onChange(selected.includes(item) ? selected.filter(p => p !== item) : [...selected, item]);
  };

  const filtered = search.trim()
    ? ALL_TOPICS.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    : ALL_TOPICS;

  const hasActive = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-md border text-sm transition-colors bg-background hover:bg-muted',
          hasActive ? 'border-primary text-primary' : 'border-input text-muted-foreground hover:text-foreground'
        )}
      >
        <span className="font-medium">{label}</span>
        {hasActive && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {selected.length}
          </span>
        )}
        {hasActive
          ? <X className="w-3.5 h-3.5 ml-0.5" onClick={e => { e.stopPropagation(); onChange([]); }} />
          : <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
        }
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 right-0 z-50 w-64 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted rounded-md outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto scrollbar-thin p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No topics found</p>
            ) : filtered.map(topic => {
              const isSelected = selected.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggle(topic)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-left transition-colors',
                    isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                  )}
                >
                  <span className={cn(
                    'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    isSelected ? 'bg-primary border-primary' : 'border-border'
                  )}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </span>
                  {topic}
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
