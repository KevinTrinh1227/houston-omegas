import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { slugify } from '../../lib/validate';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  download_url: string;
  type: string;
}

// POST: Sync wiki pages from GitHub docs/ directory (exec only)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { owner: string; repo: string; path?: string };
    const owner = body.owner || 'KevinTrinh1227';
    const repo = body.repo || 'houston-omegas';
    const docsPath = body.path || 'docs';

    // Fetch file tree from GitHub API (public repo, no token needed)
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${docsPath}`,
      { headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'HoustonOmegas-Wiki-Sync' } }
    );

    if (!treeRes.ok) {
      return error(`GitHub API error: ${treeRes.status}`, 502);
    }

    const files: GitHubFile[] = await treeRes.json();
    const mdFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
      return json({ synced: 0, message: 'No .md files found in docs/ directory' });
    }

    let synced = 0;
    const errors: string[] = [];

    for (const file of mdFiles) {
      try {
        // Check if we already have this exact version
        const existing = await context.env.DB.prepare(
          `SELECT id, github_sha FROM wiki_pages WHERE github_path = ?`
        ).bind(file.path).first();

        if (existing && existing.github_sha === file.sha) continue;

        // Fetch file content
        const contentRes = await fetch(file.download_url, {
          headers: { 'User-Agent': 'HoustonOmegas-Wiki-Sync' },
        });
        if (!contentRes.ok) {
          errors.push(`Failed to fetch ${file.name}`);
          continue;
        }

        let content = await contentRes.text();

        // Extract title from first H1 or filename
        let title = file.name.replace(/\.md$/, '').replace(/[-_]/g, ' ');
        const h1Match = content.match(/^#\s+(.+)$/m);
        if (h1Match) {
          title = h1Match[1];
          content = content.replace(/^#\s+.+\n?/, '');
        }

        const slug = slugify(title);
        if (!slug) {
          errors.push(`Could not generate slug for ${file.name}`);
          continue;
        }

        if (existing) {
          // Update existing synced page
          await context.env.DB.prepare(
            `UPDATE wiki_pages SET title = ?, body = ?, github_sha = ?, updated_at = datetime('now'), updated_by = ? WHERE id = ?`
          ).bind(title, content.trim(), file.sha, result.auth.member.id, existing.id).run();
        } else {
          // Check if slug conflicts with a manual page
          const slugConflict = await context.env.DB.prepare(
            `SELECT id FROM wiki_pages WHERE slug = ?`
          ).bind(slug).first();

          const finalSlug = slugConflict ? `gh-${slug}` : slug;
          const id = generateId();

          await context.env.DB.prepare(
            `INSERT INTO wiki_pages (id, slug, title, body, category, source, github_path, github_sha, created_by)
             VALUES (?, ?, ?, ?, 'General', 'github', ?, ?, ?)`
          ).bind(id, finalSlug, title, content.trim(), file.path, file.sha, result.auth.member.id).run();
        }

        synced++;
      } catch {
        errors.push(`Error processing ${file.name}`);
      }
    }

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'wiki_github_sync', 'wiki', null, { synced, errors: errors.length }, ip);

    return json({ synced, total: mdFiles.length, errors });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
