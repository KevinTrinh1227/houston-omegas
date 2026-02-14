import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { error, options } from '../../lib/response';

// GET: Export members to CSV
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status'); // 'active', 'inactive', or null for all
    const eboard = url.searchParams.get('eboard'); // 'true', 'false', or null for all

    let query = `SELECT m.id, m.email, m.first_name, m.last_name, m.role, m.membership_status,
                        m.eboard_position, m.phone, m.class_year, m.major, m.instagram,
                        m.discord_id, m.is_active, m.created_at, m.last_login_at
                 FROM members m WHERE 1=1`;
    const params: (string | number)[] = [];

    if (status === 'active') {
      query += ` AND m.is_active = 1 AND m.membership_status = 'active'`;
    } else if (status === 'inactive') {
      query += ` AND (m.is_active = 0 OR m.membership_status = 'inactive')`;
    }

    if (eboard === 'true') {
      query += ` AND m.eboard_position IS NOT NULL`;
    } else if (eboard === 'false') {
      query += ` AND m.eboard_position IS NULL`;
    }

    query += ` ORDER BY m.last_name ASC, m.first_name ASC`;

    const members = await context.env.DB.prepare(query).bind(...params).all();

    // Get chairs for all members
    const memberIds = (members.results || []).map((m: Record<string, unknown>) => m.id as string);
    const memberChairs: Record<string, string[]> = {};

    if (memberIds.length > 0) {
      const chairsResult = await context.env.DB.prepare(
        `SELECT mc.member_id, ac.display_name
         FROM member_chairs mc
         JOIN available_chairs ac ON mc.chair_name = ac.name
         WHERE mc.member_id IN (${memberIds.map(() => '?').join(', ')})`
      ).bind(...memberIds).all();

      for (const row of chairsResult.results || []) {
        const r = row as Record<string, unknown>;
        const memberId = r.member_id as string;
        const chairName = r.display_name as string;
        if (!memberChairs[memberId]) memberChairs[memberId] = [];
        memberChairs[memberId].push(chairName);
      }
    }

    // Build CSV
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Role',
      'E-Board Position',
      'Chair Positions',
      'Status',
      'Class Year',
      'Major',
      'Phone',
      'Instagram',
      'Discord ID',
      'Join Date',
      'Last Login',
    ];

    const rows = (members.results || []).map((m: Record<string, unknown>) => {
      const memberId = m.id as string;
      const chairs = memberChairs[memberId] || [];
      return [
        m.first_name || '',
        m.last_name || '',
        m.email || '',
        m.role || '',
        m.eboard_position || '',
        chairs.join('; '),
        m.is_active === 1 ? 'Active' : 'Inactive',
        m.class_year || '',
        m.major || '',
        m.phone || '',
        m.instagram || '',
        m.discord_id || '',
        m.created_at ? new Date(m.created_at as string).toLocaleDateString() : '',
        m.last_login_at ? new Date((m.last_login_at as string) + 'Z').toLocaleDateString() : 'Never',
      ];
    });

    const csv = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="members-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
