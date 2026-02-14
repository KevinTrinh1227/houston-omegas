'use client';

import { Search, X, Filter, ChevronDown, Grid, List, Download, UserX, Users, CheckSquare } from 'lucide-react';
import type { MemberFiltersState, SortState, SortField, ViewMode, AvailableChair, PaginationState } from '@/lib/member-types';
import { useState, useRef, useEffect } from 'react';

interface MemberFiltersProps {
  filters: MemberFiltersState;
  onFiltersChange: (filters: MemberFiltersState) => void;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  availableChairs: AvailableChair[];
  classYears: string[];
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  selectedCount?: number;
  onBulkAction?: (action: string) => void;
  className?: string;
}

export default function MemberFilters({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  availableChairs,
  classYears,
  pagination,
  onPageChange,
  onLimitChange,
  selectedCount = 0,
  onBulkAction,
  className = '',
}: MemberFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const bulkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) {
        setShowBulkActions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeFilterCount = [
    filters.status !== 'all',
    filters.eboard !== 'all',
    filters.chair !== 'all',
    filters.classYear !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      eboard: 'all',
      chair: 'all',
      classYear: 'all',
      search: '',
    });
  };

  const selectClass = 'bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-xs px-3 py-2 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all';
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top bar: Search + Filter Toggle + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Search by name, email, major..."
            className="w-full pl-9 pr-8 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-text-muted hover:text-dash-text transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Bulk Actions (when items selected) */}
        {selectedCount > 0 && onBulkAction && (
          <div className="relative" ref={bulkRef}>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 transition-all text-xs uppercase tracking-wider font-medium"
            >
              <CheckSquare size={14} />
              <span>{selectedCount} Selected</span>
              <ChevronDown size={12} className={`transition-transform ${showBulkActions ? 'rotate-180' : ''}`} />
            </button>

            {showBulkActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-dash-card border border-dash-border rounded-xl shadow-xl z-50 py-1">
                <button
                  onClick={() => { setShowBulkActions(false); onBulkAction('change-status'); }}
                  className="w-full text-left px-3 py-2 text-xs text-dash-text hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                >
                  <UserX size={12} />
                  Change Status
                </button>
                <button
                  onClick={() => { setShowBulkActions(false); onBulkAction('assign-chair'); }}
                  className="w-full text-left px-3 py-2 text-xs text-dash-text hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                >
                  <Users size={12} />
                  Assign Chair
                </button>
                <div className="border-t border-dash-border my-1" />
                <button
                  onClick={() => { setShowBulkActions(false); onBulkAction('export'); }}
                  className="w-full text-left px-3 py-2 text-xs text-dash-text hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                >
                  <Download size={12} />
                  Export Selected
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filter Toggle */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-xs uppercase tracking-wider font-medium ${
              activeFilterCount > 0
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                : 'bg-dash-card border-dash-border text-dash-text-secondary hover:border-dash-text-muted'
            }`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-dash-card border border-dash-border rounded-xl shadow-xl z-50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] text-dash-text-muted hover:text-dash-text transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as typeof filters.status })}
                  className={selectClass + ' w-full'}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* E-Board */}
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">E-Board</label>
                <select
                  value={filters.eboard}
                  onChange={(e) => onFiltersChange({ ...filters, eboard: e.target.value as typeof filters.eboard })}
                  className={selectClass + ' w-full'}
                >
                  <option value="all">All</option>
                  <option value="eboard">E-Board Only</option>
                  <option value="non-eboard">Non E-Board</option>
                </select>
              </div>

              {/* Chair */}
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Chair</label>
                <select
                  value={filters.chair}
                  onChange={(e) => onFiltersChange({ ...filters, chair: e.target.value })}
                  className={selectClass + ' w-full'}
                >
                  <option value="all">All Chairs</option>
                  {availableChairs.filter(c => c.is_active).map(chair => (
                    <option key={chair.name} value={chair.name}>{chair.display_name}</option>
                  ))}
                </select>
              </div>

              {/* Class Year */}
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Class Year</label>
                <select
                  value={filters.classYear}
                  onChange={(e) => onFiltersChange({ ...filters, classYear: e.target.value })}
                  className={selectClass + ' w-full'}
                >
                  <option value="all">All Years</option>
                  {classYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <select
          value={`${sort.field}-${sort.order}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-') as [SortField, 'asc' | 'desc'];
            onSortChange({ field, order });
          }}
          className={`${selectClass} hidden sm:block`}
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="class_year-desc">Class Year (New)</option>
          <option value="class_year-asc">Class Year (Old)</option>
          <option value="last_login_at-desc">Recent Login</option>
        </select>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-dash-border overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-dash-card text-dash-text-muted hover:text-dash-text'
            }`}
            title="Grid view"
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-dash-card text-dash-text-muted hover:text-dash-text'
            }`}
            title="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-dash-badge-bg rounded-full text-dash-text">
              Status: {filters.status}
              <button onClick={() => onFiltersChange({ ...filters, status: 'all' })} className="hover:text-dash-text-muted">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.eboard !== 'all' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-dash-badge-bg rounded-full text-dash-text">
              E-Board: {filters.eboard === 'eboard' ? 'Yes' : 'No'}
              <button onClick={() => onFiltersChange({ ...filters, eboard: 'all' })} className="hover:text-dash-text-muted">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.chair !== 'all' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-dash-badge-bg rounded-full text-dash-text">
              Chair: {availableChairs.find(c => c.name === filters.chair)?.display_name || filters.chair}
              <button onClick={() => onFiltersChange({ ...filters, chair: 'all' })} className="hover:text-dash-text-muted">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.classYear !== 'all' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-dash-badge-bg rounded-full text-dash-text">
              Class: {filters.classYear}
              <button onClick={() => onFiltersChange({ ...filters, classYear: 'all' })} className="hover:text-dash-text-muted">
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-dash-text-muted uppercase tracking-wider">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-dash-input border border-dash-input-border rounded-md text-dash-text text-xs px-2 py-1 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
            <span className="text-[10px] text-dash-text-muted">
              of <span className="font-medium text-dash-text">{pagination.total}</span> members
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={pagination.page <= 1}
                className="text-[10px] px-2 py-1 rounded border border-dash-border text-dash-text-secondary hover:border-dash-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                First
              </button>
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="text-[10px] px-2 py-1 rounded border border-dash-border text-dash-text-secondary hover:border-dash-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>
              <span className="px-3 text-xs text-dash-text">
                {pagination.page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                className="text-[10px] px-2 py-1 rounded border border-dash-border text-dash-text-secondary hover:border-dash-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={pagination.page >= totalPages}
                className="text-[10px] px-2 py-1 rounded border border-dash-border text-dash-text-secondary hover:border-dash-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Last
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
