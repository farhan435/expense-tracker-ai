'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import ExpenseItem from './ExpenseItem';
import DeleteModal from './DeleteModal';
import EmptyState from './EmptyState';
import { useExpenseContext } from '@/context/ExpenseContext';

interface ExpenseListProps {
  expenses: Expense[];
  showLoadMore?: boolean;
}

const PAGE_SIZE = 20;

export default function ExpenseList({ expenses, showLoadMore = true }: ExpenseListProps) {
  const { removeExpense } = useExpenseContext();
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const displayed = expenses.slice(0, visible);
  const hasMore = visible < expenses.length;

  const confirmDelete = () => {
    if (deleteTarget) {
      removeExpense(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <EmptyState
        message="No expenses found"
        subMessage="Try adjusting your filters or add a new expense"
      />
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {displayed.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>

        {showLoadMore && hasMore && (
          <div className="px-4 py-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Load {Math.min(PAGE_SIZE, expenses.length - visible)} more →
            </button>
          </div>
        )}
      </div>

      <DeleteModal
        expense={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
