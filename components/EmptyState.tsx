import { Receipt } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export default function EmptyState({
  message = 'No expenses found',
  subMessage = 'Try adjusting your filters or add a new expense',
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Receipt className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-600 mb-1">{message}</h3>
      <p className="text-sm text-slate-400">{subMessage}</p>
    </div>
  );
}
