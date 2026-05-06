'use client';

import { Trash2, AlertTriangle } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface DeleteModalProps {
  expense: Expense | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ expense, onConfirm, onCancel }: DeleteModalProps) {
  if (!expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Trash2 className="w-7 h-7 text-red-600" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 text-center mb-1">
          Delete this expense?
        </h3>
        <p className="text-slate-500 text-sm text-center mb-1 font-medium">
          &ldquo;{expense.description}&rdquo;
        </p>
        <p className="text-slate-400 text-sm text-center mb-6">
          {formatCurrency(expense.amount)} · {expense.category}
        </p>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-700 text-xs font-medium">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
