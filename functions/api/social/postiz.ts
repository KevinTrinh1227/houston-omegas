import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error, options } from '../../lib/response';

const POSTIZ_BASE_URL = 'https://social.houstonomegas.com';

interface PostizIntegration {
  id: string;
  name: string;
  providerIdentifier: string;
  picture?: string;
  type: string;
  disabled: boolean;
}

interface PostizPost {
  id: string;
  content: string;
  publishDate?: string;
  state: string;
  integration: {
    id: string;
    name: string;
    providerIdentifier: string;
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const endpoint = url.searchParams.get('endpoint') || 'integrations';

    const apiKey = context.env.POSTIZ_API_KEY;
    if (!apiKey) {
      return json({
        error: 'Postiz API key not configured',
        integrations: [],
        posts: [],
      });
    }

    const baseUrl = context.env.POSTIZ_BASE_URL || POSTIZ_BASE_URL;
    const apiUrl = `${baseUrl}/public/v1/${endpoint}`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return json({
          error: `Postiz API error: ${response.status}`,
          details: errorText,
          integrations: [],
          posts: [],
        });
      }

      const data = await response.json();
      return json(data);
    } catch (fetchError) {
      return json({
        error: 'Failed to connect to Postiz',
        integrations: [],
        posts: [],
      });
    }
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
