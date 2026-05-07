'use client';

import { useState, useMemo } from 'react';
import {
  X,
  Download,
  FileText,
  FileJson,
  File,
  Calendar,
  CheckSquare,
  Square,
  Eye,
  Loader2,
  FileDown,
  Info,
} from 'lucide-react';
import { Expense, Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportCSV, exportJSON, exportPDF } from '@/lib/export-utils';

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportModalProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function nMonthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  ext: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: 'csv',
    label: 'CSV',
    ext: '.csv',
    icon: FileText,
    description: 'Spreadsheet-ready',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
  },
  {
    id: 'json',
    label: 'JSON',
    ext: '.json',
    icon: FileJson,
    description: 'Structured data',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-400',
  },
  {
    id: 'pdf',
    label: 'PDF',
    ext: '.pdf',
    icon: File,
    description: 'Print-ready report',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-400',
  },
];

const PRESET_RANGES: { label: string; start: string; end: string }[] = [
  { label: 'All time', start: '', end: '' },
  { label: 'This month', start: monthStart(), end: localToday() },
  { label: 'Last 3 months', start: nMonthsAgo(3), end: localToday() },
  { label: 'Last 6 months', start: nMonthsAgo(6), end: localToday() },
];

const PREVIEW_LIMIT = 8;

export default function ExportModal({ expenses, isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCats, setSelectedCats] = useState<Set<Category>>(
    new Set(CATEGORIES)
  );
  const [filename, setFilename] = useState(
    `expenses-${localToday()}`
  );
  const [exporting, setExporting] = useState(false);
  const [activePreset, setActivePreset] = useState('All time');

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = selectedCats.has(e.category);
      const matchStart = !startDate || e.date >= startDate;
      const matchEnd = !endDate || e.date <= endDate;
      return matchCat && matchStart && matchEnd;
    });
  }, [expenses, selectedCats, startDate, endDate]);

  const summary = useMemo(() => {
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const cats = new Set(filtered.map((e) => e.category));
    return { total, catCount: cats.size };
  }, [filtered]);

  function toggleCategory(cat: Category) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function toggleAll() {
    setSelectedCats(
      selectedCats.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES)
    );
  }

  function applyPreset(preset: (typeof PRESET_RANGES)[number]) {
    setStartDate(preset.start);
    setEndDate(preset.end);
    setActivePreset(preset.label);
  }

  async function handleExport() {
    if (filtered.length === 0) return;
    setExporting(true);
    await new Promise((r) => setTimeout(r, 700));
    const name = filename.trim() || `expenses-${localToday()}`;
    if (format === 'csv') exportCSV(filtered, name);
    else if (format === 'json') exportJSON(filtered, name);
    else exportPDF(filtered, name);
    setExporting(false);
  }

  const selectedFormat = FORMAT_OPTIONS.find((f) => f.id === format)!;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Export Data</h2>
              <p className="text-xs text-slate-400">
                Configure and download your expense data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── Left: Configuration ── */}
          <div className="w-72 xl:w-80 flex-shrink-0 border-r border-slate-100 overflow-y-auto p-5 space-y-6">

            {/* Format selection */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Format
              </p>
              <div className="space-y-2">
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = format === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setFormat(opt.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        active
                          ? `${opt.border} ${opt.bg}`
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          active ? opt.bg : 'bg-slate-100'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${active ? opt.color : 'text-slate-400'}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${active ? opt.color : 'text-slate-700'}`}
                        >
                          {opt.label}
                          <span className="font-normal text-xs ml-1 opacity-60">
                            {opt.ext}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400">{opt.description}</p>
                      </div>
                      {active && (
                        <div
                          className={`ml-auto w-2 h-2 rounded-full ${opt.color.replace('text-', 'bg-')}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Date Range
              </p>
              {/* Preset chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PRESET_RANGES.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      activePreset === p.label
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setActivePreset('');
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setActivePreset('');
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Categories
                </p>
                <button
                  onClick={toggleAll}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {selectedCats.size === CATEGORIES.length
                    ? 'Deselect all'
                    : 'Select all'}
                </button>
              </div>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const cfg = CATEGORY_CONFIG[cat];
                  const checked = selectedCats.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                        checked
                          ? `${cfg.bgColor} ${cfg.textColor}`
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-base leading-none">{cfg.emoji}</span>
                      <span className="text-sm font-semibold">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filename */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Filename
              </p>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm text-slate-700 bg-transparent focus:outline-none min-w-0"
                  placeholder="expenses-2026-05-07"
                />
                <span className={`px-3 py-2 text-xs font-bold border-l border-slate-200 flex-shrink-0 ${selectedFormat.color} ${selectedFormat.bg}`}>
                  {selectedFormat.ext}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Preview ── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-w-0">

            {/* Summary banner */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Records',
                  value: filtered.length.toString(),
                  sub: 'to export',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                },
                {
                  label: 'Total',
                  value: formatCurrency(summary.total),
                  sub: 'combined',
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                },
                {
                  label: 'Categories',
                  value: summary.catCount.toString(),
                  sub: 'included',
                  color: 'text-violet-600',
                  bg: 'bg-violet-50',
                },
              ].map(({ label, value, sub, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Preview table */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-bold text-slate-700">
                  Preview
                </p>
                <span className="text-xs text-slate-400">
                  (showing {Math.min(PREVIEW_LIMIT, filtered.length)} of{' '}
                  {filtered.length})
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-400">
                    No records match your filters
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Adjust the date range or categories
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {['Date', 'Description', 'Category', 'Amount'].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider last:text-right"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.slice(0, PREVIEW_LIMIT).map((e) => {
                        const cfg = CATEGORY_CONFIG[e.category];
                        return (
                          <tr
                            key={e.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                              {formatDate(e.date)}
                            </td>
                            <td className="px-4 py-2.5 text-sm text-slate-700 max-w-[200px] truncate">
                              {e.description}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.bgColor} ${cfg.textColor}`}
                              >
                                {cfg.emoji} {e.category}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-sm font-bold text-slate-800 text-right whitespace-nowrap">
                              {formatCurrency(e.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filtered.length > PREVIEW_LIMIT && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-center">
                      <p className="text-xs text-slate-400 font-medium">
                        +{filtered.length - PREVIEW_LIMIT} more rows will be
                        included in the export
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Format-specific info */}
            <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${selectedFormat.bg} ${selectedFormat.border.replace('border-', 'border-').split('-').slice(0, -1).join('-') + '-100'}`}>
              <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selectedFormat.color}`} />
              <p className={`text-xs font-medium ${selectedFormat.color}`}>
                {format === 'csv' &&
                  'Exports a comma-separated file. Open directly in Excel, Google Sheets, or any spreadsheet app.'}
                {format === 'json' &&
                  'Exports structured JSON with metadata. Ideal for importing into other apps or scripts.'}
                {format === 'pdf' &&
                  'Opens a formatted report in a new tab. Use your browser\'s Print dialog to save as PDF.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
          <p className="text-xs text-slate-400">
            {filtered.length > 0 ? (
              <>
                <span className="font-semibold text-slate-600">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>{' '}
                ready to export as{' '}
                <span className={`font-semibold ${selectedFormat.color}`}>
                  {format.toUpperCase()}
                </span>
              </>
            ) : (
              'Select at least one category and adjust filters'
            )}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || filtered.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                format === 'csv'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : format === 'json'
                  ? 'bg-violet-600 hover:bg-violet-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting
                ? 'Exporting…'
                : `Export as ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
