'use client';

import { useState, useMemo } from 'react';
import { Plus, Download, BarChart3 } from 'lucide-react';
import { useExpenseContext } from '@/context/ExpenseContext';
import ExpenseFilters from '@/components/ExpenseFilters';
import ExpenseList from '@/components/ExpenseList';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { Category } from '@/lib/types';

export default function ExpensesPage() {
  const { expenses, loading, openDrawer } = useExpenseContext();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return expenses.filter((e) => {
      const matchSearch = !q || e.description.toLowerCase().includes(q);
      const matchCat = category === 'All' || e.category === category;
      const matchStart = !startDate || e.date >= startDate;
      const matchEnd = !endDate || e.date <= endDate;
      return matchSearch && matchCat && matchStart && matchEnd;
    });
  }, [expenses, search, category, startDate, endDate]);

  const filteredTotal = useMemo(
    () => filtered.reduce((s, e) => s + e.amount, 0),
    [filtered]
  );

  const handleClear = () => {
    setSearch('');
    setCategory('All');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading expenses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500 text-sm">
              {filtered.length === expenses.length ? (
                <>
                  {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                </>
              ) : (
                <>
                  {filtered.length} of {expenses.length} shown
                </>
              )}
            </p>
            {filtered.length > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <p className="text-sm font-semibold text-slate-700">
                  {formatCurrency(filteredTotal)} total
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => openDrawer()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Shown',
              value: filtered.length.toString(),
              sub: 'expenses',
            },
            {
              label: 'Total',
              value: formatCurrency(filteredTotal),
              sub: 'combined amount',
            },
            {
              label: 'Average',
              value: formatCurrency(filteredTotal / filtered.length),
              sub: 'per expense',
            },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {label}
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{value}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <ExpenseFilters
        search={search}
        category={category}
        startDate={startDate}
        endDate={endDate}
        onSearch={setSearch}
        onCategory={setCategory}
        onStartDate={setStartDate}
        onEndDate={setEndDate}
        onClear={handleClear}
      />

      {/* Expense list */}
      <ExpenseList expenses={filtered} />
    </div>
  );
}
