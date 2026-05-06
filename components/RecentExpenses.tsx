import { Expense } from '@/lib/types';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/constants';
import CategoryBadge from './CategoryBadge';

interface RecentExpensesProps {
  expenses: Expense[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No transactions yet — add your first expense!
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {expenses.map((expense) => {
        const config = CATEGORY_CONFIG[expense.category];
        return (
          <div
            key={expense.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
            >
              <span className="text-base leading-none">{config.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {expense.description}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatDateShort(expense.date)}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <CategoryBadge category={expense.category} showEmoji={false} />
              <p className="text-sm font-semibold text-slate-800">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
