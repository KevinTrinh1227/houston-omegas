import type { Env } from '../types';

export interface SEOArticle {
  id: number;
  brand_id: number;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  cover_image_url: string | null;
  content_type: 'how-to' | 'listicle' | 'comparison' | 'guide' | 'news-angle';
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  quality_score: number | null;
  word_count: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SEOStats {
  total_articles: number;
  published: number;
  pending: number;
  approved: number;
  draft: number;
  rejected: number;
  total_keywords: number;
}

export interface SEOKeyword {
  id: number;
  keyword: string;
  search_volume: number;
  difficulty: number;
  status: string;
}

export interface SEOEngineClient {
  getArticles: (params?: { status?: string; page?: number; limit?: number }) => Promise<{ articles: SEOArticle[]; total: number }>;
  getArticle: (id: number) => Promise<SEOArticle | null>;
  getArticleBySlug: (slug: string) => Promise<SEOArticle | null>;
  getStats: () => Promise<SEOStats>;
  approveArticle: (id: number) => Promise<boolean>;
  rejectArticle: (id: number) => Promise<boolean>;
  getKeywords: () => Promise<SEOKeyword[]>;
}

export function createSEOEngine(env: Env): SEOEngineClient {
  const baseUrl = env.SEO_ENGINE_URL || 'http://localhost:3010';
  const apiKey = env.SEO_ENGINE_API_KEY;
  const brandId = env.SEO_BRAND_ID || '3';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const fetchWithAuth = async (path: string, options: RequestInit = {}) => {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
    if (!res.ok) {
      throw new Error(`SEO Engine error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  };

  return {
    async getArticles(params = {}) {
      const query = new URLSearchParams();
      query.set('brand_id', brandId);
      if (params.status) query.set('status', params.status);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));

      const data = await fetchWithAuth(`/api/articles?${query.toString()}`);
      return { articles: data.articles || [], total: data.total || 0 };
    },

    async getArticle(id: number) {
      try {
        const data = await fetchWithAuth(`/api/articles/${id}`);
        return data.article || null;
      } catch {
        return null;
      }
    },

    async getArticleBySlug(slug: string) {
      try {
        const data = await fetchWithAuth(`/api/articles/slug/${slug}?brand_id=${brandId}`);
        return data.article || null;
      } catch {
        return null;
      }
    },

    async getStats() {
      const data = await fetchWithAuth(`/api/brands/${brandId}/stats`);
      return {
        total_articles: data.total_articles || 0,
        published: data.published || 0,
        pending: data.pending || 0,
        approved: data.approved || 0,
        draft: data.draft || 0,
        rejected: data.rejected || 0,
        total_keywords: data.total_keywords || 0,
      };
    },

    async approveArticle(id: number) {
      try {
        await fetchWithAuth(`/api/articles/${id}/approve`, { method: 'POST' });
        return true;
      } catch {
        return false;
      }
    },

    async rejectArticle(id: number) {
      try {
        await fetchWithAuth(`/api/articles/${id}/reject`, { method: 'POST' });
        return true;
      } catch {
        return false;
      }
    },

    async getKeywords() {
      try {
        const data = await fetchWithAuth(`/api/brands/${brandId}/keywords`);
        return data.keywords || [];
      } catch {
        return [];
      }
    },
  };
}
