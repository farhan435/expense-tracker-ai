'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants';

interface ExpenseFiltersProps {
  search: string;
  category: Category | 'All';
  startDate: string;
  endDate: string;
  onSearch: (v: string) => void;
  onCategory: (v: Category | 'All') => void;
  onStartDate: (v: string) => void;
  onEndDate: (v: string) => void;
  onClear: () => void;
}

export default function ExpenseFilters({
  search,
  category,
  startDate,
  endDate,
  onSearch,
  onCategory,
  onStartDate,
  onEndDate,
  onClear,
}: ExpenseFiltersProps) {
  const hasFilters = search || category !== 'All' || startDate || endDate;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4">
      {/* Top row: search + date range + clear */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-500">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-semibold">Filters</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:border-slate-300 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:border-slate-300 transition-colors"
          />
          <span className="text-slate-400 text-sm font-medium">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:border-slate-300 transition-colors"
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCategory('All')}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
            category === 'All'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategory(cat)}
              style={active ? { backgroundColor: cfg.color } : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                active
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cfg.emoji}</span>
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
