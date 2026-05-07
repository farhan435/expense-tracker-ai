const KEY = 'expense-tracker-export-history-v1';

export interface ExportRecord {
  id: string;
  template: string;
  format: string;
  destination: string;
  timestamp: string;
  records: number;
  sizeKB: number;
  status: 'completed' | 'scheduled' | 'failed';
}

function daysAgo(n: number, h = 10, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

const SEED: ExportRecord[] = [
  { id: 's1', template: 'Tax Report',        format: 'CSV',  destination: 'Download',      timestamp: daysAgo(1, 22, 30), records: 40, sizeKB: 2.4,  status: 'completed' },
  { id: 's2', template: 'Monthly Summary',   format: 'PDF',  destination: 'Email',         timestamp: daysAgo(2, 9, 15),  records: 40, sizeKB: 156,  status: 'completed' },
  { id: 's3', template: 'Category Analysis', format: 'JSON', destination: 'Google Drive',  timestamp: daysAgo(4, 14, 45), records: 40, sizeKB: 8.1,  status: 'completed' },
  { id: 's4', template: 'All Data',          format: 'CSV',  destination: 'Dropbox',       timestamp: daysAgo(7, 11, 20), records: 38, sizeKB: 2.1,  status: 'completed' },
  { id: 's5', template: 'Business Expense',  format: 'CSV',  destination: 'Download',      timestamp: daysAgo(9, 16, 5),  records: 22, sizeKB: 1.3,  status: 'completed' },
  { id: 's6', template: 'Monthly Summary',   format: 'PDF',  destination: 'Email',         timestamp: daysAgo(14, 9, 0),  records: 35, sizeKB: 142,  status: 'completed' },
  { id: 's7', template: 'Tax Report',        format: 'CSV',  destination: 'OneDrive',      timestamp: daysAgo(30, 10, 0), records: 28, sizeKB: 1.9,  status: 'failed'    },
];

export function getHistory(): ExportRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as ExportRecord[];
  } catch { /* ignore */ }
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}

export function addToHistory(record: Omit<ExportRecord, 'id'>): ExportRecord {
  const entry: ExportRecord = { ...record, id: `${Date.now()}` };
  const all = getHistory();
  all.unshift(entry);
  try { localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50))); } catch { /* ignore */ }
  return entry;
}
