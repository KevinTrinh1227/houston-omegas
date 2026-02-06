import { describe, it, expect } from 'vitest';

// Test meeting and action item logic

const VALID_MEETING_TYPES = ['chapter', 'exec', 'committee', 'special'];
const VALID_ACTION_STATUSES = ['open', 'in_progress', 'completed'];

describe('meeting types', () => {
  it('has 4 meeting types', () => {
    expect(VALID_MEETING_TYPES).toHaveLength(4);
  });

  it('includes exec for restricted meetings', () => {
    expect(VALID_MEETING_TYPES).toContain('exec');
  });
});

describe('action item statuses', () => {
  it('has 3 statuses', () => {
    expect(VALID_ACTION_STATUSES).toHaveLength(3);
  });

  it('follows progression', () => {
    expect(VALID_ACTION_STATUSES[0]).toBe('open');
    expect(VALID_ACTION_STATUSES[2]).toBe('completed');
  });
});

describe('meeting visibility', () => {
  function canViewMeeting(meetingType: string, isExec: boolean): boolean {
    if (meetingType === 'exec' && !isExec) return false;
    return true;
  }

  it('exec meetings hidden from non-exec', () => {
    expect(canViewMeeting('exec', false)).toBe(false);
  });

  it('exec meetings visible to exec', () => {
    expect(canViewMeeting('exec', true)).toBe(true);
  });

  it('chapter meetings visible to all', () => {
    expect(canViewMeeting('chapter', false)).toBe(true);
    expect(canViewMeeting('chapter', true)).toBe(true);
  });

  it('committee meetings visible to all', () => {
    expect(canViewMeeting('committee', false)).toBe(true);
  });
});

describe('action item assignment', () => {
  function canEditActionItem(assignedTo: string | null, memberId: string, role: string): boolean {
    if (assignedTo === memberId) return true;
    if (['admin', 'president', 'secretary'].includes(role)) return true;
    return false;
  }

  it('assigned member can edit', () => {
    expect(canEditActionItem('member1', 'member1', 'active')).toBe(true);
  });

  it('secretary can edit any', () => {
    expect(canEditActionItem('member1', 'member2', 'secretary')).toBe(true);
  });

  it('unrelated active member cannot edit', () => {
    expect(canEditActionItem('member1', 'member2', 'active')).toBe(false);
  });

  it('admin can edit any', () => {
    expect(canEditActionItem('member1', 'member2', 'admin')).toBe(true);
  });

  it('unassigned item editable by exec', () => {
    expect(canEditActionItem(null, 'member1', 'president')).toBe(true);
    expect(canEditActionItem(null, 'member1', 'active')).toBe(false);
  });
});
