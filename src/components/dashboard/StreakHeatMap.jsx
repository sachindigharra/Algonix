import React, { useMemo, useState } from 'react';
import { format, startOfYear, endOfYear, startOfWeek, addDays, getMonth, getYear } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function StreakHeatmap({ problems }) {
  const today = new Date();
  const currentYear = getYear(today);

  // Build available years from problems data + current year
  const availableYears = useMemo(() => {
    const years = new Set([currentYear]);
    (problems || []).forEach(p => {
      if (p.solved_date) years.add(getYear(new Date(p.solved_date)));
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [problems, currentYear]);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const activityMap = useMemo(() => {
    const map = {};
    (problems || []).forEach(p => {
      if (p.solved_date) {
        const d = format(new Date(p.solved_date), 'yyyy-MM-dd');
        map[d] = (map[d] || 0) + 1;
      }
    });
    return map;
  }, [problems]);

  const getIntensity = (count) => {
    if (!count) return 'bg-muted opacity-40';
    if (count === 1) return 'bg-green-300/50';
    if (count <= 3) return 'bg-green-400/70';
    if (count <= 5) return 'bg-green-500';
    return 'bg-green-600';
  };

  const weeks = useMemo(() => {
    const yearStart = startOfWeek(startOfYear(new Date(selectedYear, 0, 1)));
    const yearEnd = selectedYear === currentYear ? today : endOfYear(new Date(selectedYear, 0, 1));
    const result = [];
    let current = yearStart;

    while (current <= yearEnd) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(current, d);
        if (date > yearEnd) break;
        if (getYear(date) < selectedYear && d === 0) break;
        const key = format(date, 'yyyy-MM-dd');
        week.push({ date, key, count: activityMap[key] || 0 });
      }
      if (week.length > 0) result.push(week);
      current = addDays(current, 7);
    }
    return result;
  }, [selectedYear, activityMap, currentYear]);

  const monthLabels = useMemo(() => {
    let lastMonth = -1;
    return weeks.map((week) => {
      const month = getMonth(week[0].date);
      if (month !== lastMonth && getYear(week[0].date) === selectedYear) {
        lastMonth = month;
        return format(week[0].date, 'MMM');
      }
      lastMonth = month;
      return null;
    });
  }, [weeks, selectedYear]);

  const yearTotal = useMemo(() => {
    return Object.entries(activityMap)
      .filter(([key]) => key.startsWith(selectedYear.toString()))
      .reduce((sum, [, v]) => sum + v, 0);
  }, [activityMap, selectedYear]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Activity</h3>
          <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground">{yearTotal} submissions in {selectedYear}</span>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-0 min-w-max">

            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2 mt-5">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-[11px] text-[9px] text-muted-foreground leading-none flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex flex-col">
              {/* Month labels */}
              <div className="flex gap-[3px] mb-1 h-4">
                {weeks.map((_, w) => (
                  <div key={w} className={cn('w-[11px] text-[9px] text-muted-foreground whitespace-nowrap', monthLabels[w] && w !== 0 && 'ml-2')}>
                    {monthLabels[w] || ''}
                  </div>
                ))}
              </div>

              {/* Cells */}
              <div className="flex gap-[3px]">
                {weeks.map((week, w) => (
                  <div key={w} className={cn('flex flex-col gap-[3px]', monthLabels[w] && w !== 0 && 'ml-2')}>
                    {week.map(({ date, key, count }, d) => (
                      <Tooltip key={d}>
                        <TooltipTrigger asChild>
                          <div className={cn(
                            'w-[11px] h-[11px] rounded-none cursor-pointer transition-opacity hover:opacity-80',
                            getIntensity(count)
                          )} />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{count} problem{count !== 1 ? 's' : ''}</p>
                          <p className="text-muted-foreground">{format(date, 'MMM d, yyyy')}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-3 justify-end">
            <span className="text-[10px] text-muted-foreground mr-1">Less</span>
            {['bg-muted opacity-40', 'bg-green-300/50', 'bg-green-400/70', 'bg-green-500', 'bg-green-600'].map((cls, i) => (
              <div key={i} className={cn('w-[11px] h-[11px] rounded-none', cls)} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">More</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
