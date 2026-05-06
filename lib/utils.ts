import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Expense, Category } from './types';

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return format(new Date(year, month - 1, day), 'MMM dd, yyyy');
};

export const formatDateShort = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return format(new Date(year, month - 1, day), 'MMM dd');
};

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const getMonthlySpending = (expenses: Expense[]): number => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return expenses
    .filter((e) => {
      const [y, m, d] = e.date.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date >= start && date <= end;
    })
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getSpendingByCategory = (
  expenses: Expense[]
): { name: string; value: number }[] => {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    map[e.category] = (map[e.category] ?? 0) + e.amount;
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const getMonthlyData = (
  expenses: Expense[],
  months = 6
): { month: string; total: number }[] => {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const ref = subMonths(new Date(), i);
    const start = startOfMonth(ref);
    const end = endOfMonth(ref);
    const total = expenses
      .filter((e) => {
        const [y, m, d] = e.date.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date >= start && date <= end;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    result.push({ month: format(ref, 'MMM'), total });
  }
  return result;
};

export const getTopCategory = (expenses: Expense[]): string => {
  const byCategory = getSpendingByCategory(expenses);
  return byCategory.length > 0 ? byCategory[0].name : '—';
};

export const exportToCSV = (expenses: Expense[]): void => {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map((e) => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
