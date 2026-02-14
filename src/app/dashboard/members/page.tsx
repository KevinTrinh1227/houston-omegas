'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { isExecRole } from '@/lib/roles';
import type {
  Member, MemberFiltersState, SortState, ViewMode, PaginationState, AvailableChair, MemberStats as MemberStatsType
} from '@/lib/member-types';

import MemberStatsDisplay from '@/components/members/MemberStats';
import MemberCharts from '@/components/members/MemberCharts';
import MemberFilters from '@/components/members/MemberFilters';
import MemberCard from '@/components/members/MemberCard';
import MemberRow from '@/components/members/MemberRow';
import AddMemberModal from '@/components/members/AddMemberModal';
import MemberEditModal from '@/components/members/MemberEditModal';
import EmptyState from '@/components/ui/EmptyState';

import { UserPlus, Download, ChevronDown, BarChart3, Users } from 'lucide-react';

export default function MembersPage() {
  const { member: currentMember } = useAuth();
  const { toast } = useToast();
  const isExec = isExecRole(currentMember?.role || '');

  // Data
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<MemberStatsType | null>(null);
  const [availableChairs, setAvailableChairs] = useState<AvailableChair[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sort
  const [filters, setFilters] = useState<MemberFiltersState>({
    status: 'all',
    eboard: 'all',
    chair: 'all',
    classYear: 'all',
    search: '',
  });
  const [sort, setSort] = useState<SortState>({ field: 'name', order: 'asc' });
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 24, total: 0 });

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch {
      toast('Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch chairs
  const fetchChairs = useCallback(async () => {
    try {
      const res = await fetch('/api/chairs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAvailableChairs(data);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!isExec) return;
    try {
      const res = await fetch('/api/members/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Ignore
    }
  }, [isExec]);

  useEffect(() => {
    fetchMembers();
    fetchChairs();
    fetchStats();
  }, [fetchMembers, fetchChairs, fetchStats]);

  // Filter & Sort members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        m.major?.toLowerCase().includes(searchLower) ||
        m.class_year?.includes(filters.search)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        result = result.filter(m => m.is_active === 1 && m.membership_status !== 'inactive');
      } else {
        result = result.filter(m => m.is_active === 0 || m.membership_status === 'inactive');
      }
    }

    // E-board filter
    if (filters.eboard !== 'all') {
      if (filters.eboard === 'eboard') {
        result = result.filter(m => m.eboard_position);
      } else {
        result = result.filter(m => !m.eboard_position);
      }
    }

    // Chair filter
    if (filters.chair !== 'all') {
      result = result.filter(m => {
        const chairs = m.chairs || (m.chair_position ? [m.chair_position] : []);
        return chairs.includes(filters.chair);
      });
    }

    // Class year filter
    if (filters.classYear !== 'all') {
      result = result.filter(m => m.class_year === filters.classYear);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'name':
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'class_year':
          comparison = (a.class_year || '').localeCompare(b.class_year || '');
          break;
        case 'last_login_at':
          const aLogin = a.last_login_at ? new Date(a.last_login_at).getTime() : 0;
          const bLogin = b.last_login_at ? new Date(b.last_login_at).getTime() : 0;
          comparison = aLogin - bLogin;
          break;
        default:
          comparison = 0;
      }
      return sort.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [members, filters, sort]);

  // Update pagination total when filtered members change
  useEffect(() => {
    setPagination(prev => ({ ...prev, total: filteredMembers.length, page: 1 }));
    setSelectedIds(new Set());
  }, [filteredMembers.length, filters]);

  // Paginated members
  const paginatedMembers = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredMembers.slice(start, start + pagination.limit);
  }, [filteredMembers, pagination.page, pagination.limit]);

  // Get unique class years
  const classYears = useMemo(() => {
    const years = new Set(members.map(m => m.class_year).filter(Boolean) as string[]);
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [members]);

  // Action handlers
  const handleAction = async (action: string, member: Member) => {
    const name = `${member.first_name} ${member.last_name}`;

    if (action === 'edit') {
      setEditingMember(member);
      return;
    }

    if (action === 'resend') {
      try {
        const res = await fetch('/api/members/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ member_id: member.id }),
        });
        if (res.ok) {
          toast(`Invite sent to ${member.email}`, 'success');
        } else {
          const data = await res.json();
          toast(data.error || 'Failed to send invite', 'error');
        }
      } catch {
        toast('Connection error', 'error');
      }
    }

    if (action === 'deactivate') {
      if (!confirm(`Deactivate ${name}? They will be logged out immediately.`)) return;
      try {
        await fetch(`/api/members/${member.id}`, { method: 'DELETE', credentials: 'include' });
        toast(`${name} has been deactivated`, 'success');
        fetchMembers();
      } catch {
        toast('Failed to deactivate', 'error');
      }
    }

    if (action === 'reactivate') {
      if (!confirm(`Reactivate ${name}?`)) return;
      try {
        await fetch(`/api/members/${member.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_active: true, role: 'active' }),
        });
        toast(`${name} has been reactivated`, 'success');
        fetchMembers();
      } catch {
        toast('Failed to reactivate', 'error');
      }
    }

    if (action === 'remove') {
      if (!confirm(`Permanently remove ${name}? This cannot be undone.`)) return;
      try {
        const res = await fetch(`/api/members/${member.id}?permanent=true`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
          toast(`${name} has been removed`, 'success');
          fetchMembers();
        } else {
          const data = await res.json();
          toast(data.error || 'Failed to remove', 'error');
        }
      } catch {
        toast('Connection error', 'error');
      }
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;

    if (action === 'export') {
      // Export selected members as CSV
      const selectedMembers = members.filter(m => selectedIds.has(m.id));
      const csv = [
        ['Name', 'Email', 'Role', 'Class Year', 'Phone', 'Status'].join(','),
        ...selectedMembers.map(m => [
          `"${m.first_name} ${m.last_name}"`,
          m.email,
          m.role,
          m.class_year || '',
          m.phone || '',
          m.is_active ? 'Active' : 'Inactive'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'members.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast(`Exported ${selectedIds.size} members`, 'success');
      return;
    }

    if (action === 'change-status') {
      const newStatus = confirm('Set selected members to Active? Click Cancel for Inactive.');
      const idsArray = Array.from(selectedIds);

      for (const id of idsArray) {
        try {
          await fetch(`/api/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ is_active: newStatus }),
          });
        } catch {
          // Continue with others
        }
      }
      toast(`Updated ${selectedIds.size} members`, 'success');
      fetchMembers();
      setSelectedIds(new Set());
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedMembers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedMembers.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string, selected: boolean) => {
    const newSet = new Set(selectedIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  // Export all
  const handleExportAll = async () => {
    try {
      const res = await fetch('/api/members/export', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all-members.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast('Export complete', 'success');
      }
    } catch {
      toast('Export failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Members</h1>
          <p className="text-sm text-dash-text-secondary mt-1">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            {filters.search || filters.status !== 'all' || filters.eboard !== 'all' || filters.chair !== 'all' || filters.classYear !== 'all'
              ? ` (filtered from ${members.length})` : ''}
          </p>
        </div>
        {isExec && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-xs uppercase tracking-wider font-medium ${
                showCharts
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'border-dash-border text-dash-text-secondary hover:border-dash-text-muted'
              }`}
            >
              <BarChart3 size={14} />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dash-border text-dash-text-secondary text-xs uppercase tracking-wider font-medium hover:border-dash-text-muted transition-all"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs uppercase tracking-wider font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
            >
              <UserPlus size={14} />
              Add Member
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {isExec && stats && (
        <MemberStatsDisplay
          total={stats.total}
          active={stats.active}
          inactive={stats.inactive}
          eboard={stats.eboard}
        />
      )}

      {/* Charts */}
      {isExec && showCharts && stats && (
        <MemberCharts
          growthData={stats.growthData}
          classYearData={Object.entries(stats.byClassYear).map(([year, count]) => ({ year, count }))}
          statusData={[
            { name: 'Active', value: stats.active },
            { name: 'Inactive', value: stats.inactive },
          ]}
          chairData={Object.entries(stats.byChair).map(([name, count]) => ({ name, count }))}
        />
      )}

      {/* Filters */}
      <MemberFilters
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableChairs={availableChairs}
        classYears={classYears}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
        selectedCount={selectedIds.size}
        onBulkAction={isExec ? handleBulkAction : undefined}
      />

      {/* Content */}
      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
        </div>
      ) : paginatedMembers.length === 0 ? (
        <EmptyState
          message={filters.search || filters.status !== 'all' || filters.eboard !== 'all' || filters.chair !== 'all' || filters.classYear !== 'all'
            ? 'No members match your filters'
            : 'No members yet'
          }
          icon={<Users size={32} />}
          action={isExec && members.length === 0 ? {
            label: 'Add First Member',
            onClick: () => setShowAddModal(true),
          } : undefined}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedMembers.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              currentMemberId={currentMember?.id}
              isExec={isExec}
              showActions={isExec}
              onAction={(action, m) => handleAction(action, m)}
              selected={selectedIds.has(member.id)}
              onSelect={isExec ? (selected) => toggleSelect(member.id, selected) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="bg-dash-card rounded-xl border border-dash-border overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-dash-border">
                {isExec && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size > 0 && selectedIds.size === paginatedMembers.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-dash-border bg-dash-input text-gray-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                  </th>
                )}
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Name</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Status</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden md:table-cell">Role</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden lg:table-cell">Chairs</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden xl:table-cell">Class</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden xl:table-cell">Last Login</th>
                {isExec && <th className="text-right text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 w-12"></th>}
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map(member => (
                <MemberRow
                  key={member.id}
                  member={member}
                  currentMemberId={currentMember?.id}
                  isExec={isExec}
                  onAction={(action, m) => handleAction(action, m)}
                  selected={selectedIds.has(member.id)}
                  onSelect={isExec ? (selected) => toggleSelect(member.id, selected) : undefined}
                  showCheckbox={isExec}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AddMemberModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchMembers();
          fetchStats();
        }}
      />

      <MemberEditModal
        open={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        availableChairs={availableChairs}
        onSuccess={() => {
          fetchMembers();
          setEditingMember(null);
        }}
      />
    </div>
  );
}
