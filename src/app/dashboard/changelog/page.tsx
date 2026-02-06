'use client';

import { useState, useEffect } from 'react';

interface Release {
  type: 'release';
  tag: string;
  name: string;
  body: string;
  published_at: string;
  url: string;
}

interface Commit {
  type: 'commit';
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export default function ChangelogPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'commits' | 'releases'>('commits');

  useEffect(() => {
    fetch('/api/github/releases', { credentials: 'include' })
      .then(res => res.ok ? res.json() : { releases: [], commits: [] })
      .then(data => {
        setReleases(data.releases || []);
        setCommits(data.commits || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Changelog</h1>
        <p className="text-sm text-gray-500 mt-1">Recent changes to the website</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('commits')}
          className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${
            tab === 'commits' ? 'bg-gray-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Commits ({commits.length})
        </button>
        <button
          onClick={() => setTab('releases')}
          className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${
            tab === 'releases' ? 'bg-gray-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Releases ({releases.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      ) : tab === 'commits' ? (
        commits.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No commits found.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {commits.map((c, i) => (
              <div key={i} className="flex gap-4 pb-6 relative">
                {/* Timeline line */}
                {i < commits.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
                )}
                {/* Dot */}
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-200 shrink-0 flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-900 mb-1 break-words">{(c.message as string)?.split('\n')[0]}</p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{c.sha}</code>
                    <span>{c.author}</span>
                    <span>{new Date(c.date).toLocaleDateString()}</span>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">View</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        releases.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No releases yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {releases.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{r.tag}</span>
                  <h3 className="text-sm font-medium text-gray-900">{r.name}</h3>
                </div>
                {r.body && <p className="text-xs text-gray-500 whitespace-pre-wrap mb-2">{r.body}</p>}
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>{new Date(r.published_at).toLocaleDateString()}</span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">View on GitHub</a>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
