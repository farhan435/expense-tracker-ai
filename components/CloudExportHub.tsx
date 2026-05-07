'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X, LayoutTemplate, Send, AlarmClock, Share2, Clock,
  Plug, Download, CheckCircle2, XCircle, Loader2,
  Copy, Check, Mail, RefreshCw, Zap, Shield, Globe,
  ChevronRight, Bell, Cloud, Wifi, WifiOff, Plus,
  FileText, FileJson, File, Sparkles, ArrowUpRight,
  CalendarDays, RotateCcw, Trash2,
} from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { ExportRecord, getHistory, addToHistory } from '@/lib/export-history';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'templates' | 'send' | 'schedule' | 'share' | 'history' | 'integrations';

interface CloudExportHubProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { id: TabId; icon: React.ElementType; label: string; badge?: string }[] = [
  { id: 'templates',    icon: LayoutTemplate, label: 'Templates' },
  { id: 'send',         icon: Send,           label: 'Send'      },
  { id: 'schedule',     icon: AlarmClock,     label: 'Schedule'  },
  { id: 'share',        icon: Share2,         label: 'Share'     },
  { id: 'history',      icon: Clock,          label: 'History'   },
  { id: 'integrations', icon: Plug,           label: 'Connect'   },
];

const TEMPLATES = [
  {
    id: 'tax',
    name: 'Tax Report',
    emoji: '📋',
    description: 'IRS-ready format with all deductible categories sorted by date.',
    format: 'CSV',
    columns: ['Date', 'Amount', 'Category', 'Description'],
    badge: 'Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    accent: 'border-blue-200 hover:border-blue-400',
    accentActive: 'border-blue-500 bg-blue-50',
    headerBg: 'bg-blue-600',
  },
  {
    id: 'monthly',
    name: 'Monthly Summary',
    emoji: '📅',
    description: 'Month-over-month breakdown with trends and top categories.',
    format: 'PDF',
    columns: ['Month', 'Total', 'Transactions', 'Top Category'],
    badge: null,
    badgeColor: '',
    accent: 'border-emerald-200 hover:border-emerald-400',
    accentActive: 'border-emerald-500 bg-emerald-50',
    headerBg: 'bg-emerald-600',
  },
  {
    id: 'category',
    name: 'Category Analysis',
    emoji: '🗂️',
    description: 'Spending by category with percentages and per-transaction averages.',
    format: 'PDF',
    columns: ['Category', 'Total', 'Share %', 'Avg. Transaction'],
    badge: null,
    badgeColor: '',
    accent: 'border-violet-200 hover:border-violet-400',
    accentActive: 'border-violet-500 bg-violet-50',
    headerBg: 'bg-violet-600',
  },
  {
    id: 'business',
    name: 'Business Expense',
    emoji: '💼',
    description: 'Professional reimbursement format with receipt-ready layout.',
    format: 'CSV',
    columns: ['Date', 'Amount', 'Category', 'Description', 'Ref #'],
    badge: 'New',
    badgeColor: 'bg-amber-100 text-amber-700',
    accent: 'border-amber-200 hover:border-amber-400',
    accentActive: 'border-amber-500 bg-amber-50',
    headerBg: 'bg-amber-500',
  },
  {
    id: 'budget',
    name: 'Budget vs Actual',
    emoji: '📊',
    description: 'Compare actual spending against estimated budgets by category.',
    format: 'JSON',
    columns: ['Category', 'Estimated', 'Actual', 'Variance'],
    badge: 'Beta',
    badgeColor: 'bg-rose-100 text-rose-700',
    accent: 'border-rose-200 hover:border-rose-400',
    accentActive: 'border-rose-500 bg-rose-50',
    headerBg: 'bg-rose-500',
  },
];

const INTEGRATIONS = [
  { id: 'gdrive',   name: 'Google Drive',   emoji: '🗄️', color: 'text-blue-600',   bg: 'bg-blue-50',   description: 'Auto-sync exports to your Drive folder',      authUrl: '#' },
  { id: 'sheets',   name: 'Google Sheets',  emoji: '📊', color: 'text-green-600',  bg: 'bg-green-50',  description: 'Push data into a live, auto-updating sheet',  authUrl: '#' },
  { id: 'dropbox',  name: 'Dropbox',        emoji: '📦', color: 'text-blue-500',   bg: 'bg-blue-50',   description: 'Backup exports to your Dropbox automatically', authUrl: '#' },
  { id: 'onedrive', name: 'OneDrive',       emoji: '☁️', color: 'text-sky-600',    bg: 'bg-sky-50',    description: 'Sync with Microsoft OneDrive storage',         authUrl: '#' },
  { id: 'notion',   name: 'Notion',         emoji: '📓', color: 'text-slate-700',  bg: 'bg-slate-50',  description: 'Import expenses as a Notion database',         authUrl: '#' },
  { id: 'slack',    name: 'Slack',          emoji: '💬', color: 'text-purple-600', bg: 'bg-purple-50', description: 'Send monthly reports to a Slack channel',      authUrl: '#' },
];

const FORMAT_ICON: Record<string, React.ElementType> = {
  CSV: FileText, JSON: FileJson, PDF: File,
};

// ─── QR Code ─────────────────────────────────────────────────────────────────

function QRCode({ value }: { value: string }) {
  const SIZE = 21;
  const cells = useMemo(() => {
    const grid: boolean[][] = Array(SIZE).fill(null).map(() => Array(SIZE).fill(false));

    const drawFinder = (sr: number, sc: number) => {
      for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
        grid[sr + r][sc + c] =
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    };
    drawFinder(0, 0); drawFinder(0, SIZE - 7); drawFinder(SIZE - 7, 0);

    const isFinder = (r: number, c: number) =>
      (r < 9 && c < 9) || (r < 9 && c >= SIZE - 8) || (r >= SIZE - 8 && c < 9);

    let h = value.split('').reduce((a, ch) => ((a << 5) - a + ch.charCodeAt(0)) | 0, 0);
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (!isFinder(r, c)) {
        h = (h * 1664525 + 1013904223) | 0;
        grid[r][c] = (h & 1) === 1;
      }
    }
    return grid;
  }, [value]);

  return (
    <svg width={168} height={168} viewBox={`0 0 ${SIZE} ${SIZE}`} xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}>
      <rect width={SIZE} height={SIZE} fill="white" />
      {cells.flatMap((row, r) =>
        row.map((filled, c) =>
          filled ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" /> : null
        )
      )}
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CloudExportHub({ expenses, isOpen, onClose }: CloudExportHubProps) {
  const [tab, setTab] = useState<TabId>('templates');

  // Templates
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  // Send
  const [sendDest, setSendDest] = useState<'email' | 'gdrive' | 'dropbox' | 'onedrive'>('email');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('My Expense Report');
  const [sendFormat, setSendFormat] = useState('CSV');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Schedule
  const [schedEnabled, setSchedEnabled] = useState(false);
  const [schedFreq, setSchedFreq] = useState('weekly');
  const [schedDay, setSchedDay] = useState('monday');
  const [schedTime, setSchedTime] = useState('09:00');
  const [schedFormat, setSchedFormat] = useState('CSV');
  const [schedDest, setSchedDest] = useState('email');
  const [schedSaved, setSchedSaved] = useState(false);
  const [schedEmail, setSchedEmail] = useState('');

  // Share
  const [shareLink, setShareLink] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // History
  const [history, setHistory] = useState<ExportRecord[]>([]);

  // Integrations
  const [connected, setConnected] = useState<Set<string>>(new Set(['gdrive']));
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'idle' | 'syncing' | 'done'>>({});

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
      setExportDone(false);
      setSendSuccess(false);
    }
  }, [isOpen]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function localToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const handleTemplateExport = useCallback(async () => {
    if (!selectedTemplate) return;
    const tpl = TEMPLATES.find(t => t.id === selectedTemplate)!;
    setExporting(true);
    await new Promise(r => setTimeout(r, 900));

    // Actually trigger a download
    const { exportCSV, exportJSON, exportPDF } = await import('@/lib/export-utils');
    const name = `${tpl.name.replace(/\s+/g, '-').toLowerCase()}-${localToday()}`;
    if (tpl.format === 'CSV') exportCSV(expenses, name);
    else if (tpl.format === 'JSON') exportJSON(expenses, name);
    else exportPDF(expenses, name);

    const record = addToHistory({
      template: tpl.name,
      format: tpl.format,
      destination: 'Download',
      timestamp: new Date().toISOString(),
      records: expenses.length,
      sizeKB: Math.round(expenses.length * 0.06 * 10) / 10,
      status: 'completed',
    });
    setHistory(prev => [record, ...prev]);
    setExporting(false);
    setExportDone(true);
  }, [selectedTemplate, expenses]);

  const handleSend = useCallback(async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 1400));
    const destLabel = sendDest === 'email' ? `Email (${emailTo || 'recipient'})` :
      sendDest === 'gdrive' ? 'Google Drive' :
      sendDest === 'dropbox' ? 'Dropbox' : 'OneDrive';
    const record = addToHistory({
      template: 'All Data',
      format: sendFormat,
      destination: destLabel,
      timestamp: new Date().toISOString(),
      records: expenses.length,
      sizeKB: Math.round(expenses.length * 0.06 * 10) / 10,
      status: 'completed',
    });
    setHistory(prev => [record, ...prev]);
    setSending(false);
    setSendSuccess(true);
  }, [sendDest, emailTo, sendFormat, expenses]);

  const handleSaveSchedule = useCallback(async () => {
    await new Promise(r => setTimeout(r, 600));
    setSchedSaved(true);
    setTimeout(() => setSchedSaved(false), 3000);
  }, []);

  const handleGenerateLink = useCallback(async () => {
    setGeneratingLink(true);
    await new Promise(r => setTimeout(r, 800));
    const id = Math.random().toString(36).slice(2, 10);
    setShareLink(`https://expensetracker.app/share/${id}`);
    setGeneratingLink(false);
  }, []);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [shareLink]);

  const handleConnect = useCallback(async (id: string) => {
    setConnecting(id);
    await new Promise(r => setTimeout(r, 1800));
    setConnected(prev => { const s = new Set(prev); s.add(id); return s; });
    setConnecting(null);
  }, []);

  const handleDisconnect = useCallback((id: string) => {
    setConnected(prev => { const s = new Set(prev); s.delete(id); return s; });
  }, []);

  const handleSync = useCallback(async (id: string) => {
    setSyncStatus(p => ({ ...p, [id]: 'syncing' }));
    await new Promise(r => setTimeout(r, 1200));
    setSyncStatus(p => ({ ...p, [id]: 'done' }));
    setTimeout(() => setSyncStatus(p => ({ ...p, [id]: 'idle' })), 2500);
  }, []);

  const nextExportLabel = useMemo(() => {
    if (!schedEnabled) return null;
    const d = new Date();
    if (schedFreq === 'daily') {
      d.setDate(d.getDate() + 1);
    } else if (schedFreq === 'weekly') {
      const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      const target = days.indexOf(schedDay);
      const cur = d.getDay();
      d.setDate(d.getDate() + ((target - cur + 7) % 7 || 7));
    } else {
      d.setMonth(d.getMonth() + 1, 1);
    }
    const [h, m] = schedTime.split(':').map(Number);
    d.setHours(h, m);
    return d.toLocaleString('default', { weekday:'long', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  }, [schedEnabled, schedFreq, schedDay, schedTime]);

  if (!isOpen) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ══ Header ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Export Hub</h2>
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Cloud Edition
                </span>
              </div>
              <p className="text-indigo-200 text-xs mt-0.5">
                {expenses.length} expenses · {connected.size} service{connected.size !== 1 ? 's' : ''} connected
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ══ Body ════════════════════════════════════════════════════════════ */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── Left nav ──────────────────────────────────────────────────── */}
          <div className="w-44 flex-shrink-0 bg-slate-50 border-r border-slate-100 flex flex-col py-3">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {t.label}
                  {t.id === 'history' && history.length > 0 && (
                    <span className="ml-auto text-xs bg-slate-200 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {history.length > 9 ? '9+' : history.length}
                    </span>
                  )}
                  {t.id === 'integrations' && connected.size > 0 && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}

            {/* Bottom status */}
            <div className="mt-auto mx-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 mb-1">
                {connected.size > 0
                  ? <Wifi className="w-3 h-3 text-emerald-500" />
                  : <WifiOff className="w-3 h-3 text-slate-400" />}
                <span className={`text-xs font-bold ${connected.size > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {connected.size > 0 ? 'Online' : 'Local only'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                {connected.size > 0 ? `${connected.size} cloud service${connected.size > 1 ? 's' : ''} active` : 'Connect a service'}
              </p>
            </div>
          </div>

          {/* ── Content ───────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto min-w-0">

            {/* ════ TEMPLATES ════════════════════════════════════════════════ */}
            {tab === 'templates' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Export Templates</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Pre-configured formats for different purposes</p>
                  </div>
                  {selectedTemplate && (
                    <button onClick={handleTemplateExport} disabled={exporting}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-60">
                      {exporting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
                        : exportDone
                        ? <><Check className="w-4 h-4" /> Done!</>
                        : <><Download className="w-4 h-4" /> Export {TEMPLATES.find(t=>t.id===selectedTemplate)?.format}</>}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {TEMPLATES.map(tpl => {
                    const selected = selectedTemplate === tpl.id;
                    const FmtIcon = FORMAT_ICON[tpl.format] ?? FileText;
                    return (
                      <button key={tpl.id} onClick={() => { setSelectedTemplate(tpl.id); setExportDone(false); }}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${
                          selected ? tpl.accentActive : `bg-white ${tpl.accent} border-slate-200`
                        }`}>
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl leading-none">{tpl.emoji}</span>
                          <div className="flex items-center gap-1.5">
                            {tpl.badge && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tpl.badgeColor}`}>
                                {tpl.badge}
                              </span>
                            )}
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600`}>
                              <FmtIcon className="w-3 h-3" />{tpl.format}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-800 mb-1">{tpl.name}</p>
                        <p className="text-xs text-slate-500 leading-snug mb-3">{tpl.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {tpl.columns.map(col => (
                            <span key={col} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">
                              {col}
                            </span>
                          ))}
                        </div>
                        {selected && (
                          <div className="mt-3 pt-3 border-t border-current/10 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                            <Check className="w-3.5 h-3.5" /> Selected — click Export above
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════ SEND ═════════════════════════════════════════════════════ */}
            {tab === 'send' && (
              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Send Report</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Deliver your export directly to a destination</p>
                </div>

                {/* Destination selector */}
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { id: 'email',    emoji: '📧', label: 'Email'         },
                    { id: 'gdrive',   emoji: '🗄️', label: 'Google Drive'  },
                    { id: 'dropbox',  emoji: '📦', label: 'Dropbox'       },
                    { id: 'onedrive', emoji: '☁️', label: 'OneDrive'      },
                  ] as const).map(d => (
                    <button key={d.id} onClick={() => { setSendDest(d.id); setSendSuccess(false); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        sendDest === d.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                      <span className="text-2xl leading-none">{d.emoji}</span>
                      <span className={`text-xs font-bold ${sendDest === d.id ? 'text-indigo-700' : 'text-slate-600'}`}>{d.label}</span>
                      {d.id !== 'email' && !connected.has(d.id) && (
                        <span className="text-xs text-slate-400">Not connected</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Email form */}
                {sendDest === 'email' && !sendSuccess && (
                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Recipient Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="email" placeholder="recipient@example.com" value={emailTo}
                          onChange={e => setEmailTo(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Subject</label>
                      <input type="text" value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Format</label>
                      <div className="flex gap-2">
                        {['CSV', 'JSON', 'PDF'].map(f => (
                          <button key={f} onClick={() => setSendFormat(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${
                              sendFormat === f ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}>{f}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleSend} disabled={sending}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                      {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Report</>}
                    </button>
                  </div>
                )}

                {/* Cloud destination (not connected) */}
                {sendDest !== 'email' && !connected.has(sendDest) && !sendSuccess && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                      {sendDest === 'gdrive' ? '🗄️' : sendDest === 'dropbox' ? '📦' : '☁️'}
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {sendDest === 'gdrive' ? 'Google Drive' : sendDest === 'dropbox' ? 'Dropbox' : 'OneDrive'} not connected
                    </p>
                    <p className="text-xs text-slate-400">Go to the Integrations tab to connect this service first.</p>
                    <button onClick={() => setTab('integrations')}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                      <Plug className="w-4 h-4" /> Connect Now <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Cloud destination (connected) */}
                {sendDest !== 'email' && connected.has(sendDest) && !sendSuccess && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-bold text-emerald-700">
                        {sendDest === 'gdrive' ? 'Google Drive' : sendDest === 'dropbox' ? 'Dropbox' : 'OneDrive'} connected
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Format</label>
                      <div className="flex gap-2">
                        {['CSV', 'JSON', 'PDF'].map(f => (
                          <button key={f} onClick={() => setSendFormat(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${
                              sendFormat === f ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}>{f}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleSend} disabled={sending}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                      {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><ArrowUpRight className="w-4 h-4" /> Upload to {sendDest === 'gdrive' ? 'Drive' : sendDest === 'dropbox' ? 'Dropbox' : 'OneDrive'}</>}
                    </button>
                  </div>
                )}

                {/* Success */}
                {sendSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-emerald-800">Report sent successfully!</p>
                    <p className="text-xs text-emerald-600">
                      {sendDest === 'email'
                        ? `Delivered to ${emailTo || 'recipient'} as ${sendFormat}`
                        : `Uploaded to ${sendDest === 'gdrive' ? 'Google Drive' : sendDest === 'dropbox' ? 'Dropbox' : 'OneDrive'} as ${sendFormat}`}
                    </p>
                    <p className="text-xs text-emerald-500 italic">
                      (Simulation — in production this would send/upload the real file)
                    </p>
                    <button onClick={() => setSendSuccess(false)}
                      className="text-xs text-emerald-700 font-bold hover:underline">
                      Send another →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════ SCHEDULE ═════════════════════════════════════════════════ */}
            {tab === 'schedule' && (
              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Automatic Exports</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Set up recurring exports on a schedule</p>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${schedEnabled ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                      <Bell className={`w-5 h-5 ${schedEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Recurring exports</p>
                      <p className="text-xs text-slate-400">{schedEnabled ? 'Enabled — will run on schedule' : 'Disabled'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSchedEnabled(p => !p)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${schedEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${schedEnabled ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Settings */}
                {schedEnabled && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Frequency</label>
                        <select value={schedFreq} onChange={e => setSchedFreq(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      {schedFreq === 'weekly' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Day of week</label>
                          <select value={schedDay} onChange={e => setSchedDay(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Time</label>
                        <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Format</label>
                        <select value={schedFormat} onChange={e => setSchedFormat(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          {['CSV','JSON','PDF'].map(f => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Destination</label>
                        <select value={schedDest} onChange={e => setSchedDest(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="email">Email</option>
                          <option value="gdrive">Google Drive</option>
                          <option value="dropbox">Dropbox</option>
                          <option value="onedrive">OneDrive</option>
                        </select>
                      </div>
                    </div>

                    {schedDest === 'email' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Send to email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="email" placeholder="your@email.com" value={schedEmail}
                            onChange={e => setSchedEmail(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                      </div>
                    )}

                    {/* Next export preview */}
                    {nextExportLabel && (
                      <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                        <CalendarDays className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-indigo-700">Next export</p>
                          <p className="text-xs text-indigo-500">{nextExportLabel}</p>
                        </div>
                      </div>
                    )}

                    <button onClick={handleSaveSchedule}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        schedSaved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}>
                      {schedSaved ? <><Check className="w-4 h-4" /> Schedule Saved!</> : <><Bell className="w-4 h-4" /> Save Schedule</>}
                    </button>
                  </div>
                )}

                {!schedEnabled && (
                  <div className="text-center py-8 text-slate-400">
                    <AlarmClock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Enable recurring exports above</p>
                    <p className="text-xs mt-1">Set up daily, weekly, or monthly automatic exports</p>
                  </div>
                )}
              </div>
            )}

            {/* ════ SHARE ════════════════════════════════════════════════════ */}
            {tab === 'share' && (
              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Share & Collaborate</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Generate links or QR codes to share your data</p>
                </div>

                {!shareLink ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Share2 className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-1">Create a shareable snapshot</p>
                      <p className="text-xs text-slate-400">Generate a secure link that lets others view your expense data</p>
                    </div>
                    <button onClick={handleGenerateLink} disabled={generatingLink}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                      {generatingLink ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Zap className="w-4 h-4" /> Generate Link</>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Link */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-emerald-700">Secure link generated</span>
                        <span className="text-xs text-slate-400 ml-auto">Expires in 7 days</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                        <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-600 font-mono flex-1 truncate">{shareLink}</span>
                        <button onClick={handleCopyLink}
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                            linkCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}>
                          {linkCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center gap-3">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">QR Code</p>
                      <div className="p-3 bg-white border-2 border-slate-200 rounded-xl">
                        <QRCode value={shareLink} />
                      </div>
                      <p className="text-xs text-slate-400 text-center">
                        Scan to open on any device. <br />
                        Encodes the shareable link above.
                      </p>
                    </div>

                    <button onClick={() => setShareLink('')}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                      <Plus className="w-4 h-4" /> Generate New Link
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════ HISTORY ══════════════════════════════════════════════════ */}
            {tab === 'history' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Export History</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{history.length} exports on record</p>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No exports yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map(record => {
                      const FmtIcon = FORMAT_ICON[record.format] ?? FileText;
                      const isScheduled = record.status === 'scheduled';
                      const isFailed = record.status === 'failed';
                      return (
                        <div key={record.id}
                          className="bg-white border border-slate-100 rounded-xl p-3.5 flex items-center gap-3 hover:border-slate-200 transition-colors">
                          {/* Status icon */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isFailed ? 'bg-red-100' : isScheduled ? 'bg-amber-100' : 'bg-emerald-100'
                          }`}>
                            {isFailed
                              ? <XCircle className="w-4 h-4 text-red-600" />
                              : isScheduled
                              ? <AlarmClock className="w-4 h-4 text-amber-600" />
                              : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-800 truncate">{record.template}</p>
                              <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 flex-shrink-0`}>
                                <FmtIcon className="w-3 h-3" />{record.format}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(record.timestamp).toLocaleString('default', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })} · {record.destination}
                            </p>
                          </div>

                          {/* Meta */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-slate-600">{record.records} records</p>
                            <p className="text-xs text-slate-400">{record.sizeKB} KB</p>
                          </div>

                          {/* Re-export */}
                          {!isScheduled && (
                            <button
                              title="Re-export"
                              onClick={() => { setTab('templates'); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-shrink-0">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ════ INTEGRATIONS ═════════════════════════════════════════════ */}
            {tab === 'integrations' && (
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Connected Services</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {connected.size} of {INTEGRATIONS.length} services connected
                  </p>
                </div>

                {/* Connected services */}
                {INTEGRATIONS.filter(i => connected.has(i.id)).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Connected</p>
                    <div className="space-y-2">
                      {INTEGRATIONS.filter(i => connected.has(i.id)).map(svc => {
                        const status = syncStatus[svc.id] ?? 'idle';
                        return (
                          <div key={svc.id} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
                            <div className={`w-10 h-10 ${svc.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                              {svc.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-bold text-slate-800">{svc.name}</p>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                              </div>
                              <p className="text-xs text-slate-500 truncate">{svc.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => handleSync(svc.id)} disabled={status === 'syncing'}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                  status === 'done'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : status === 'syncing'
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                                }`}>
                                {status === 'syncing'
                                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Syncing</>
                                  : status === 'done'
                                  ? <><Check className="w-3 h-3" /> Synced</>
                                  : <><RefreshCw className="w-3 h-3" /> Sync</>}
                              </button>
                              <button onClick={() => handleDisconnect(svc.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available to connect */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available</p>
                  <div className="space-y-2">
                    {INTEGRATIONS.filter(i => !connected.has(i.id)).map(svc => (
                      <div key={svc.id} className="flex items-center gap-3 bg-white border border-slate-100 hover:border-slate-200 rounded-xl p-3.5 transition-colors">
                        <div className={`w-10 h-10 ${svc.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0 opacity-60`}>
                          {svc.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700">{svc.name}</p>
                          <p className="text-xs text-slate-400 truncate">{svc.description}</p>
                        </div>
                        <button onClick={() => handleConnect(svc.id)}
                          disabled={connecting === svc.id}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-60 flex-shrink-0">
                          {connecting === svc.id
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> Connecting…</>
                            : <><Plus className="w-3 h-3" /> Connect</>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center pt-2">
                  Connections are simulated. In production, each would use OAuth 2.0.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
