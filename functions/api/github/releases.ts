import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    // Fetch recent commits from the repo (public API, no auth needed)
    const [releasesRes, commitsRes] = await Promise.all([
      fetch('https://api.github.com/repos/KevinTrinh1227/houston-omegas/releases?per_page=10', {
        headers: { 'User-Agent': 'Houston-Omegas-Dashboard' },
      }),
      fetch('https://api.github.com/repos/KevinTrinh1227/houston-omegas/commits?per_page=20', {
        headers: { 'User-Agent': 'Houston-Omegas-Dashboard' },
      }),
    ]);

    const releases = releasesRes.ok ? await releasesRes.json() : [];
    const commits = commitsRes.ok ? await commitsRes.json() : [];

    // Format releases
    const formattedReleases = (releases as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => ({
      type: 'release',
      tag: r.tag_name,
      name: r.name,
      body: r.body,
      published_at: r.published_at,
      url: r.html_url,
    }));

    // Format commits
    const formattedCommits = (commits as Array<Record<string, unknown>>).map((c: Record<string, unknown>) => {
      const commit = c.commit as Record<string, unknown>;
      const author = commit.author as Record<string, unknown>;
      return {
        type: 'commit',
        sha: (c.sha as string)?.slice(0, 7),
        message: commit.message,
        author: author?.name,
        date: author?.date,
        url: c.html_url,
      };
    });

    return json({
      releases: formattedReleases,
      commits: formattedCommits,
    });
  } catch {
    return error('Internal server error', 500);
  }
};
