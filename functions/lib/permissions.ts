import type { Member, AuthenticatedContext } from '../types';
import { EXEC_ROLES } from '../types';

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string;
}

export interface MemberPermissions {
  memberId: string;
  role: string;
  eboardPosition: string | null;
  chairs: string[];
  tags: string[];
  permissions: string[];
}

export async function getMemberPermissions(
  db: D1Database,
  memberId: string
): Promise<MemberPermissions> {
  const member = await db.prepare(
    `SELECT id, role, eboard_position, membership_status FROM members WHERE id = ?`
  ).bind(memberId).first();

  if (!member) {
    return {
      memberId,
      role: 'inactive',
      eboardPosition: null,
      chairs: [],
      tags: [],
      permissions: [],
    };
  }

  const chairsResult = await db.prepare(
    `SELECT chair_name FROM member_chairs WHERE member_id = ?`
  ).bind(memberId).all();
  const chairs = (chairsResult.results || []).map((r: Record<string, unknown>) => r.chair_name as string);

  const tagsResult = await db.prepare(
    `SELECT tag FROM member_tags WHERE member_id = ?`
  ).bind(memberId).all();
  const tags = (tagsResult.results || []).map((r: Record<string, unknown>) => r.tag as string);

  const rolePermsResult = await db.prepare(
    `SELECT DISTINCT p.name FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role_type = 'role' AND rp.role_name = ?`
  ).bind(member.role as string).all();
  const rolePerms = (rolePermsResult.results || []).map((r: Record<string, unknown>) => r.name as string);

  let eboardPerms: string[] = [];
  if (member.eboard_position) {
    const eboardPermsResult = await db.prepare(
      `SELECT DISTINCT p.name FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_type = 'eboard' AND rp.role_name = ?`
    ).bind(member.eboard_position as string).all();
    eboardPerms = (eboardPermsResult.results || []).map((r: Record<string, unknown>) => r.name as string);
  }

  let chairPerms: string[] = [];
  if (chairs.length > 0) {
    const placeholders = chairs.map(() => '?').join(', ');
    const chairPermsResult = await db.prepare(
      `SELECT DISTINCT p.name FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_type = 'chair' AND rp.role_name IN (${placeholders})`
    ).bind(...chairs).all();
    chairPerms = (chairPermsResult.results || []).map((r: Record<string, unknown>) => r.name as string);
  }

  const allPermissions = [...new Set([...rolePerms, ...eboardPerms, ...chairPerms])];

  return {
    memberId,
    role: member.role as string,
    eboardPosition: member.eboard_position as string | null,
    chairs,
    tags,
    permissions: allPermissions,
  };
}

export async function hasPermission(
  db: D1Database,
  memberId: string,
  permission: string
): Promise<boolean> {
  const perms = await getMemberPermissions(db, memberId);
  return perms.permissions.includes(permission);
}

export async function requirePermission(
  db: D1Database,
  auth: AuthenticatedContext,
  permission: string
): Promise<Response | null> {
  const has = await hasPermission(db, auth.member.id, permission);
  if (!has) {
    return new Response(JSON.stringify({ error: 'Permission denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

export function isEboard(member: Member & { eboard_position?: string | null }): boolean {
  if (member.eboard_position) return true;
  return EXEC_ROLES.includes(member.role);
}

export async function isEboardAsync(db: D1Database, memberId: string): Promise<boolean> {
  const member = await db.prepare(
    `SELECT role, eboard_position FROM members WHERE id = ?`
  ).bind(memberId).first();

  if (!member) return false;
  if (member.eboard_position) return true;
  return EXEC_ROLES.includes(member.role as Member['role']);
}

export async function getAllPermissions(db: D1Database): Promise<Permission[]> {
  const result = await db.prepare(
    `SELECT id, name, description, category FROM permissions ORDER BY category, name`
  ).all();
  return (result.results || []) as Permission[];
}

export async function getAvailableChairs(db: D1Database): Promise<Array<{
  name: string;
  display_name: string;
  description: string | null;
  is_active: number;
}>> {
  const result = await db.prepare(
    `SELECT name, display_name, description, is_active FROM available_chairs WHERE is_active = 1 ORDER BY display_name`
  ).all();
  return (result.results || []) as Array<{
    name: string;
    display_name: string;
    description: string | null;
    is_active: number;
  }>;
}

export async function getAvailableTags(db: D1Database): Promise<Array<{
  name: string;
  display_name: string;
  color: string;
}>> {
  const result = await db.prepare(
    `SELECT name, display_name, color FROM available_tags ORDER BY display_name`
  ).all();
  return (result.results || []) as Array<{
    name: string;
    display_name: string;
    color: string;
  }>;
}

export async function assignChair(
  db: D1Database,
  memberId: string,
  chairName: string,
  assignedBy: string
): Promise<boolean> {
  try {
    await db.prepare(
      `INSERT OR IGNORE INTO member_chairs (member_id, chair_name, assigned_by) VALUES (?, ?, ?)`
    ).bind(memberId, chairName, assignedBy).run();
    return true;
  } catch {
    return false;
  }
}

export async function removeChair(
  db: D1Database,
  memberId: string,
  chairName: string
): Promise<boolean> {
  try {
    await db.prepare(
      `DELETE FROM member_chairs WHERE member_id = ? AND chair_name = ?`
    ).bind(memberId, chairName).run();
    return true;
  } catch {
    return false;
  }
}

export async function assignTag(
  db: D1Database,
  memberId: string,
  tag: string,
  assignedBy: string
): Promise<boolean> {
  try {
    await db.prepare(
      `INSERT OR IGNORE INTO member_tags (member_id, tag, assigned_by) VALUES (?, ?, ?)`
    ).bind(memberId, tag, assignedBy).run();
    return true;
  } catch {
    return false;
  }
}

export async function removeTag(
  db: D1Database,
  memberId: string,
  tag: string
): Promise<boolean> {
  try {
    await db.prepare(
      `DELETE FROM member_tags WHERE member_id = ? AND tag = ?`
    ).bind(memberId, tag).run();
    return true;
  } catch {
    return false;
  }
}

export async function getMembersWithChair(
  db: D1Database,
  chairName: string
): Promise<Array<{ member_id: string; first_name: string; last_name: string; avatar_url: string | null }>> {
  const result = await db.prepare(
    `SELECT m.id as member_id, m.first_name, m.last_name, m.avatar_url
     FROM members m
     JOIN member_chairs mc ON m.id = mc.member_id
     WHERE mc.chair_name = ? AND m.is_active = 1
     ORDER BY m.first_name, m.last_name`
  ).bind(chairName).all();
  return (result.results || []) as Array<{ member_id: string; first_name: string; last_name: string; avatar_url: string | null }>;
}

export async function getMembersWithTag(
  db: D1Database,
  tag: string
): Promise<Array<{ member_id: string; first_name: string; last_name: string; avatar_url: string | null }>> {
  const result = await db.prepare(
    `SELECT m.id as member_id, m.first_name, m.last_name, m.avatar_url
     FROM members m
     JOIN member_tags mt ON m.id = mt.member_id
     WHERE mt.tag = ? AND m.is_active = 1
     ORDER BY m.first_name, m.last_name`
  ).bind(tag).all();
  return (result.results || []) as Array<{ member_id: string; first_name: string; last_name: string; avatar_url: string | null }>;
}

export async function logActivity(
  db: D1Database,
  memberId: string | null,
  actionType: string,
  description: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await db.prepare(
    `INSERT INTO activity_feed (member_id, action_type, entity_type, entity_id, description, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    memberId,
    actionType,
    entityType || null,
    entityId || null,
    description,
    metadata ? JSON.stringify(metadata) : null
  ).run();
}

export async function getActivityFeed(
  db: D1Database,
  limit: number = 20,
  offset: number = 0
): Promise<Array<{
  id: number;
  member_id: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  metadata: string | null;
  created_at: string;
  member_name?: string;
  avatar_url?: string;
}>> {
  const result = await db.prepare(
    `SELECT af.*, m.first_name, m.last_name, m.avatar_url
     FROM activity_feed af
     LEFT JOIN members m ON af.member_id = m.id
     ORDER BY af.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(limit, offset).all();

  return (result.results || []).map((row: Record<string, unknown>) => ({
    id: row.id as number,
    member_id: row.member_id as string | null,
    action_type: row.action_type as string,
    entity_type: row.entity_type as string | null,
    entity_id: row.entity_id as string | null,
    description: row.description as string,
    metadata: row.metadata as string | null,
    created_at: row.created_at as string,
    member_name: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : undefined,
    avatar_url: row.avatar_url as string | undefined,
  }));
}
