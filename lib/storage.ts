import { Expense } from './types';

const STORAGE_KEY = 'expense-tracker-v1';

export const getExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
};

export const saveExpenses = (expenses: Expense[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

export const persistAdd = (expense: Expense): void => {
  const all = getExpenses();
  all.unshift(expense);
  saveExpenses(all);
};

export const persistUpdate = (updated: Expense): void => {
  const all = getExpenses();
  const idx = all.findIndex((e) => e.id === updated.id);
  if (idx !== -1) {
    all[idx] = updated;
    saveExpenses(all);
  }
};

export const persistDelete = (id: string): void => {
  saveExpenses(getExpenses().filter((e) => e.id !== id));
};
