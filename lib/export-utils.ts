import { format } from 'date-fns';
import { Expense } from './types';
import { formatCurrency } from './utils';

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(expenses: Expense[], filename: string): void {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map(e => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
  ]);
  const content = [headers, ...rows].map(r => r.join(',')).join('\n');
  downloadBlob(new Blob([content], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

export function exportJSON(expenses: Expense[], filename: string): void {
  const payload = {
    exported_at: new Date().toISOString(),
    total_records: expenses.length,
    total_amount: parseFloat(expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)),
    expenses: expenses.map(({ id: _id, createdAt: _c, ...rest }) => rest),
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `${filename}.json`
  );
}

export function exportPDF(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const categorySet = Array.from(new Set(expenses.map(e => e.category)));
  const rows = expenses.map((e, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}">
      <td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px">${e.date}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#1e293b;font-size:12px">${e.description}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;font-size:12px">
        <span style="background:#eff6ff;color:#2563eb;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600">${e.category}</span>
      </td>
      <td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:12px;text-align:right">${formatCurrency(e.amount)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${filename}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;padding:48px;background:#fff}@media print{body{padding:24px}.no-print{display:none}}</style>
  </head><body>
  <div style="display:flex;justify-content:space-between;margin-bottom:36px;padding-bottom:24px;border-bottom:2px solid #e2e8f0">
    <div><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:10px;display:flex;align-items:center;justify-content:center"><span style="color:white;font-size:18px">📊</span></div>
      <span style="font-size:22px;font-weight:800;color:#0f172a">ExpenseTracker</span></div>
      <p style="font-size:13px;color:#94a3b8">Cloud Export Report</p></div>
    <div style="text-align:right"><p style="font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:600">Generated</p>
      <p style="font-size:14px;font-weight:700;color:#475569;margin-top:2px">${format(new Date(), 'MMM dd, yyyy HH:mm')}</p></div></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px">
    <div style="background:#eef2ff;border-radius:14px;padding:18px;border:1px solid #c7d2fe">
      <p style="font-size:10px;color:#a5b4fc;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Records</p>
      <p style="font-size:28px;font-weight:800;color:#4338ca;margin-top:6px">${expenses.length}</p></div>
    <div style="background:#f0fdf4;border-radius:14px;padding:18px;border:1px solid #bbf7d0">
      <p style="font-size:10px;color:#86efac;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Total</p>
      <p style="font-size:28px;font-weight:800;color:#15803d;margin-top:6px">${formatCurrency(total)}</p></div>
    <div style="background:#faf5ff;border-radius:14px;padding:18px;border:1px solid #e9d5ff">
      <p style="font-size:10px;color:#d8b4fe;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Categories</p>
      <p style="font-size:13px;font-weight:700;color:#7c3aed;margin-top:6px">${categorySet.join(', ')}</p></div></div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <thead><tr style="background:#f1f5f9">
      <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid #e2e8f0">Date</th>
      <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid #e2e8f0">Description</th>
      <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid #e2e8f0">Category</th>
      <th style="padding:11px 14px;text-align:right;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid #e2e8f0">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr style="background:#f8fafc">
      <td colspan="3" style="padding:12px 14px;font-size:13px;font-weight:700;color:#475569;border-top:2px solid #cbd5e1">Total (${expenses.length} records)</td>
      <td style="padding:12px 14px;font-size:15px;font-weight:800;color:#4338ca;border-top:2px solid #cbd5e1;text-align:right">${formatCurrency(total)}</td></tr></tfoot></table>
  <div class="no-print" style="margin-top:28px;text-align:center">
    <button onclick="window.print()" style="background:#6366f1;color:white;border:none;padding:10px 28px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">Print / Save as PDF</button></div>
  </body></html>`;

  const win = window.open('', '_blank', 'width=960,height=720');
  if (!win) { alert('Please allow pop-ups to export as PDF.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
}
