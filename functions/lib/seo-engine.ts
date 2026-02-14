import type { Env } from '../types';

export interface SEOArticle {
  id: number;
  brand_id: number;
  keyword_id: number | null;
  content_type: 'how-to' | 'listicle' | 'comparison' | 'guide' | 'news-angle';
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  cover_image_url: string | null;
  quality_score: number | null;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  keyword?: string;
  first_name?: string;
  last_name?: string;
  word_count?: number;
}

export interface SEOStats {
  total_articles: number;
  published: number;
  pending: number;
  draft: number;
  approved: number;
  rejected: number;
  total_keywords: number;
  total_distributions: number;
}

export interface SEOKeyword {
  id: number;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  intent: string | null;
  cluster: string | null;
  priority: number;
  status: string;
  created_at: string;
}

export interface SEOEngineClient {
  getArticles(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ articles: SEOArticle[]; total: number; page: number; limit: number }>;
  getArticle(id: number): Promise<SEOArticle>;
  getArticleBySlug(slug: string): Promise<SEOArticle | null>;
  getStats(): Promise<SEOStats>;
  approveArticle(id: number): Promise<{ success: boolean }>;
  rejectArticle(id: number): Promise<{ success: boolean }>;
  getKeywords(params?: {
    status?: string;
    cluster?: string;
    page?: number;
    limit?: number;
  }): Promise<{ keywords: SEOKeyword[]; total: number }>;
}

export function createSEOEngine(env: Env): SEOEngineClient {
  const baseUrl = env.SEO_ENGINE_URL || 'http://localhost:3010';
  const apiKey = env.SEO_ENGINE_API_KEY;
  const brandId = env.SEO_BRAND_ID || '3';

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SEO Engine error: ${res.status} ${text}`);
    }

    return res.json();
  }

  return {
    async getArticles(params = {}) {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      const qs = query.toString();
      return request(`/api/brands/${brandId}/content${qs ? `?${qs}` : ''}`);
    },

    async getArticle(id: number) {
      return request(`/api/content/${id}`);
    },

    async getArticleBySlug(slug: string) {
      try {
        const data = await request<{ articles: SEOArticle[] }>(
          `/api/brands/${brandId}/content?slug=${encodeURIComponent(slug)}&limit=1`
        );
        return data.articles?.[0] || null;
      } catch {
        return null;
      }
    },

    async getStats() {
      const [all, published, pending, draft, approved, rejected, keywords] = await Promise.all([
        request<{ total: number }>(`/api/brands/${brandId}/content?limit=1`),
        request<{ total: number }>(`/api/brands/${brandId}/content?status=published&limit=1`),
        request<{ total: number }>(`/api/brands/${brandId}/content?status=pending&limit=1`),
        request<{ total: number }>(`/api/brands/${brandId}/content?status=draft&limit=1`),
        request<{ total: number }>(`/api/brands/${brandId}/content?status=approved&limit=1`),
        request<{ total: number }>(`/api/brands/${brandId}/content?status=rejected&limit=1`),
        request<{ total: number }>(`/api/brands/${brandId}/keywords?limit=1`).catch(() => ({ total: 0 })),
      ]);

      return {
        total_articles: all.total || 0,
        published: published.total || 0,
        pending: pending.total || 0,
        draft: draft.total || 0,
        approved: approved.total || 0,
        rejected: rejected.total || 0,
        total_keywords: keywords.total || 0,
        total_distributions: 0,
      };
    },

    async approveArticle(id: number) {
      return request(`/api/content/${id}/approve`, { method: 'POST' });
    },

    async rejectArticle(id: number) {
      return request(`/api/content/${id}/reject`, { method: 'POST' });
    },

    async getKeywords(params = {}) {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.cluster) query.set('cluster', params.cluster);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      const qs = query.toString();
      return request(`/api/brands/${brandId}/keywords${qs ? `?${qs}` : ''}`);
    },
  };
}
