import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DIFFICULTY_MAP = {
  'easy': 'easy', 'medium': 'medium', 'hard': 'hard',
  'EASY': 'easy', 'MEDIUM': 'medium', 'HARD': 'hard',
};

function parseSheet(sheet, companyName) {
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows
    .filter(row => {
      const title = row['Title'] || row['title'];
      const difficulty = row['Difficulty'] || row['difficulty'];
      const link = row['Link'] || row['link'] || row['URL'] || row['url'];
      const topics = row['Topics'] || row['topics'];
      // 5 mandatory fields: title, difficulty, link, topics, company
      return title && difficulty && link && topics && companyName;
    })
    .map(row => ({
      title: String(row['Title'] || row['title']).trim(),
      difficulty: DIFFICULTY_MAP[String(row['Difficulty'] || row['difficulty'] || '').trim()] || 'medium',
      url: String(row['Link'] || row['link'] || row['URL'] || row['url'] || '').trim(),
      tags: String(row['Topics'] || row['topics'] || '')
        .split(',').map(t => t.trim()).filter(Boolean),
      companies: [companyName],
      platform: 'leetcode',
      status: 'todo',
      notes: '',
      approach: '',
      time_complexity: '',
      space_complexity: '',
      sheet: 'none',
      revision_dates: [],
    }));
}

// Merge problems with same title — combine their companies
function mergeProblems(allProblems) {
  const map = new Map();
  allProblems.forEach(p => {
    if (map.has(p.title)) {
      const existing = map.get(p.title);
      existing.companies = [...new Set([...existing.companies, ...p.companies])];
      existing.tags = [...new Set([...existing.tags, ...p.tags])];
    } else {
      map.set(p.title, { ...p });
    }
  });
  return Array.from(map.values());
}

export default function ImportProblems() {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedSheets, setSelectedSheets] = useState([]);

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'array' });
      const sheets = workbook.SheetNames.map(name => ({
        name,
        problems: parseSheet(workbook.Sheets[name], name === 'All' ? null : name),
      })).filter(s => s.problems.length > 0);

      setPreview({ fileName: file.name, sheets });
      setSelectedSheets(sheets.map(s => s.name));
      setResult(null);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const toggleSheet = (name) => {
    setSelectedSheets(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const problems = preview.sheets
        .filter(s => selectedSheets.includes(s.name))
        .flatMap(s => s.problems);

      // Merge companies for same title
      const merged = mergeProblems(problems).map(p => ({ ...p, user_id: user.id }));

      const BATCH = 100;
      let inserted = 0;
      for (let i = 0; i < merged.length; i += BATCH) {
        const { error } = await supabase.from('problems').upsert(
          merged.slice(i, i + BATCH),
          { onConflict: 'user_id,title', ignoreDuplicates: false }
        );
        if (error) throw error;
        inserted += Math.min(BATCH, merged.length - i);
      }

      setResult({ success: true, count: inserted });
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setImporting(false);
    }
  };

  const totalProblems = preview
    ? mergeProblems(
        preview.sheets.filter(s => selectedSheets.includes(s.name)).flatMap(s => s.problems)
      ).length
    : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Problems</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your company-wise Excel sheet to bulk import problems
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer',
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
        )}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input id="file-input" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileInput} />
        <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">Drop your Excel file here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">Supports .xlsx, .xls — each sheet treated as a company</p>
      </div>

      {/* Sheet Selection */}
      {preview && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{preview.fileName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{preview.sheets.length} sheets found</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPreview(null); setResult(null); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {preview.sheets.map(s => (
              <button
                key={s.name}
                onClick={() => toggleSheet(s.name)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  selectedSheets.includes(s.name)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                )}
              >
                {s.name} <span className="opacity-70">({s.problems.length})</span>
              </button>
            ))}
          </div>

          {/* Preview Table */}
          {selectedSheets.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Title</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Difficulty</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground hidden md:table-cell">Topics</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground hidden md:table-cell">Company</th>
                  </tr>
                </thead>
                <tbody>
                  {mergeProblems(
                    preview.sheets
                      .filter(s => selectedSheets.includes(s.name))
                      .flatMap(s => s.problems)
                  ).slice(0, 8).map((p, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium truncate max-w-[180px]">{p.title}</td>
                        <td className="px-3 py-2">
                          <Badge className={cn('text-[10px]',
                            p.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                            p.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          )}>{p.difficulty}</Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground hidden md:table-cell truncate max-w-[160px]">
                          {p.tags.slice(0, 2).join(', ')}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">
                          {p.companies.join(', ') || '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {totalProblems > 8 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{totalProblems - 8} more problems
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalProblems}</span> problems selected
            </p>
            <Button onClick={handleImport} disabled={importing || totalProblems === 0}>
              {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</> : <><Upload className="w-4 h-4 mr-2" /> Import Problems</>}
            </Button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-xl border text-sm',
          result.success ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-destructive/10 border-destructive/20 text-destructive'
        )}>
          {result.success
            ? <><CheckCircle2 className="w-5 h-5 flex-shrink-0" /> Successfully imported <strong>{result.count}</strong> problems into your tracker!</>
            : <><AlertCircle className="w-5 h-5 flex-shrink-0" /> Import failed: {result.message}</>
          }
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/30 rounded-xl border border-border p-5 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected Format</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Each sheet = one company (sheet name used as company tag)</li>
          <li>Mandatory columns: <code className="bg-muted px-1 rounded">Title</code>, <code className="bg-muted px-1 rounded">Difficulty</code>, <code className="bg-muted px-1 rounded">Link</code>, <code className="bg-muted px-1 rounded">Topics</code> + sheet name as Company</li>
          <li>Same problem in multiple sheets → merged with all companies listed</li>
          <li>Rows missing any mandatory field are skipped automatically</li>
        </ul>
      </div>
    </div>
  );
}
