// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function LeetCodeSync() {
  const [username, setUsername] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch local problems
  const { data: localProblems = [] } = useQuery({
    queryKey: ['problems-for-sync'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'leetcode');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch LeetCode submissions
  const fetchLeetCodeSubmissions = async (username) => {
    try {
      const response = await fetch('https://leetcode.com/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operationName: 'getUserProfile',
          query: `
            query getUserProfile($username: String!) {
              allQuestionsCount {
                difficulty
                count
              }
              matchedUser(username: $username) {
                username
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                    submissions
                  }
                  totalSubmissionNum {
                    difficulty
                    count
                    submissions
                  }
                }
              }
            }
          `,
          variables: { username },
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch from LeetCode');
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'LeetCode API error');
      }

      return data.data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error fetching LeetCode data: ${errorMsg}`);
    }
  };

  // Fetch detailed submission data
  const fetchDetailedSubmissions = async (username) => {
    try {
      // Use the community LeetCode API for detailed submissions
      const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);

      if (response.status === 404) {
        throw new Error('LeetCode user not found');
      }

      if (!response.ok) throw new Error('Failed to fetch detailed stats');

      const stats = await response.json();

      // Fallback: fetch from alternative endpoint to get submission list
      const submissionsResponse = await fetch(
        `https://leetcode.com/api/submissions/?offset=0&limit=20&lastkey=&username=${username}`
      );

      let submissions = [];
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        submissions = submissionsData.submissions_dump || [];
      }

      return { stats, submissions };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error fetching detailed submissions: ${errorMsg}`);
    }
  };

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!username.trim()) {
        throw new Error('Please enter your LeetCode username');
      }

      setSyncing(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch LeetCode data
        const detailedData = await fetchDetailedSubmissions(username);

        // Since we can't easily get all submission titles, we'll use a fuzzy match approach
        // For now, we'll fetch from the user's profile stats
        const leetcodeStats = detailedData.stats;

        // Parse the problems that have been solved by checking submissions
        const solvedProblems = new Set();

        // Try to get submissions from alternative sources
        if (detailedData.submissions && Array.isArray(detailedData.submissions)) {
          detailedData.submissions.forEach((sub) => {
            if (sub.status === 'ac') {
              // "ac" means accepted/solved
              solvedProblems.add(sub.title || sub.problem?.title);
            }
          });
        }

        // Match with local problems (case-insensitive)
        const matched = [];
        const unmatched = [];

        for (const localProblem of localProblems) {
          const isMatched = Array.from(solvedProblems).some(
            (solvedTitle) =>
              solvedTitle &&
              localProblem.title.toLowerCase() === solvedTitle.toLowerCase()
          );

          if (isMatched) {
            matched.push(localProblem);
          } else {
            unmatched.push(localProblem);
          }
        }

        // Bulk update matched problems
        const updatePromises = matched.map((problem) =>
          supabase
            .from('problems')
            .update({
              status: 'solved',
              solved_date: new Date().toISOString().split('T')[0], // Today's date
            })
            .eq('id', problem.id)
            .eq('user_id', user?.id ?? '')
        );

        await Promise.all(updatePromises);

        const results = {
          username,
          total: localProblems.length,
          matched: matched.length,
          unmatched: unmatched.length,
          matchedProblems: matched,
          unmatchedProblems: unmatched,
          leetcodeStats,
        };

        setSyncResults(results);
        setShowResults(true);
        toast.success(`Synced! ${matched.length} problems marked as solved.`);
        queryClient.invalidateQueries({ queryKey: ['problems'] });
      } finally {
        setSyncing(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Sync failed');
    },
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sync with LeetCode</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare your local problems with your LeetCode solve history and auto-mark solved problems
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">LeetCode Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSync()}
            disabled={syncing}
          />
          <p className="text-xs text-muted-foreground mt-1">e.g., Sachin_31_Sharma</p>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing || !username.trim()}
          className="w-full"
        >
          {syncing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Sync Problems
            </>
          )}
        </Button>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will fetch your LeetCode submissions and automatically mark matching problems as "solved".
            Your local problem list will be updated with today's date as the solve date.
          </AlertDescription>
        </Alert>
      </div>

      {/* Results Section */}
      {showResults && syncResults && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sync Results</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResults(false)}
            >
              Clear
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <div className="text-sm text-muted-foreground">Total Local Problems</div>
              <div className="text-3xl font-bold mt-2">{syncResults.total}</div>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <div className="text-sm text-muted-foreground">Matched & Solved</div>
              <div className="text-3xl font-bold mt-2 text-green-600">{syncResults.matched}</div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <div className="text-sm text-muted-foreground">Not Found on LeetCode</div>
              <div className="text-3xl font-bold mt-2 text-yellow-600">{syncResults.unmatched}</div>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="text-sm text-muted-foreground">Match Rate</div>
              <div className="text-3xl font-bold mt-2 text-blue-600">
                {Math.round((syncResults.matched / syncResults.total) * 100)}%
              </div>
            </div>
          </div>

          {/* Matched Problems */}
          {syncResults.matched > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Matched & Marked Solved ({syncResults.matched})
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {syncResults.matchedProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-start justify-between p-3 bg-green-500/5 rounded border border-green-500/20"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{problem.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {problem.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {problem.platform}
                        </Badge>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unmatched Problems */}
          {syncResults.unmatched > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-yellow-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Not Found on LeetCode ({syncResults.unmatched})
              </h3>
              <p className="text-sm text-muted-foreground">
                These problems may not have been solved on your LeetCode account, or the titles don't match exactly.
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {syncResults.unmatchedProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-start justify-between p-3 bg-yellow-500/5 rounded border border-yellow-500/20"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{problem.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {problem.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {problem.platform}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!showResults && (
        <div className="bg-blue-500/5 rounded-lg border border-blue-500/20 p-4 space-y-2">
          <h3 className="font-semibold text-sm">How it works:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Enter your LeetCode username (e.g., Sachin_31_Sharma)</li>
            <li>• We'll fetch your accepted submissions from LeetCode</li>
            <li>• Problems matching by title will be automatically marked as "solved"</li>
            <li>• The solve date will be set to today</li>
            <li>• You can review the matched and unmatched problems</li>
          </ul>
        </div>
      )}
    </div>
  );
}
