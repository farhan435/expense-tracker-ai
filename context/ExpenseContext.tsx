'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Expense } from '@/lib/types';
import { getExpenses, persistAdd, persistUpdate, persistDelete } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { seedSampleData } from '@/lib/sample-data';

interface ExpenseContextValue {
  expenses: Expense[];
  loading: boolean;
  drawerOpen: boolean;
  editingExpense: Expense | null;
  openDrawer: (expense?: Expense) => void;
  closeDrawer: () => void;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const stored = getExpenses();
    if (stored.length === 0) {
      setExpenses(seedSampleData());
    } else {
      setExpenses(stored);
    }
    setLoading(false);
  }, []);

  const openDrawer = useCallback((expense?: Expense) => {
    setEditingExpense(expense ?? null);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingExpense(null);
  }, []);

  const addExpense = useCallback(
    (data: Omit<Expense, 'id' | 'createdAt'>) => {
      const expense: Expense = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      persistAdd(expense);
      setExpenses((prev) => [expense, ...prev]);
    },
    []
  );

  const updateExpense = useCallback((expense: Expense) => {
    persistUpdate(expense);
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
  }, []);

  const removeExpense = useCallback((id: string) => {
    persistDelete(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        drawerOpen,
        editingExpense,
        openDrawer,
        closeDrawer,
        addExpense,
        updateExpense,
        removeExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext(): ExpenseContextValue {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenseContext must be used within ExpenseProvider');
  return ctx;
}
