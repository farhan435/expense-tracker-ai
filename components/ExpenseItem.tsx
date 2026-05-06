'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { useExpenseContext } from '@/context/ExpenseContext';
import CategoryBadge from './CategoryBadge';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (expense: Expense) => void;
}

export default function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  const { openDrawer } = useExpenseContext();
  const config = CATEGORY_CONFIG[expense.category];

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50/80 transition-colors group">
      {/* Category icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
      >
        <span className="text-lg leading-none">{config.emoji}</span>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800 truncate max-w-[280px]">
            {expense.description}
          </span>
          <CategoryBadge category={expense.category} showEmoji={false} />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(expense.date)}</p>
      </div>

      {/* Amount */}
      <p className="text-sm font-bold text-slate-800 flex-shrink-0">
        {formatCurrency(expense.amount)}
      </p>

      {/* Actions — visible on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => openDrawer(expense)}
          title="Edit expense"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(expense)}
          title="Delete expense"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
