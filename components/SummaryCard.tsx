import { LucideIcon } from 'lucide-react';

type CardColor = 'blue' | 'green' | 'purple' | 'amber' | 'rose';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: CardColor;
}

const palette: Record<CardColor, { icon: string; value: string; border: string; bg: string }> = {
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
    border: 'border-blue-100',
    bg: 'bg-gradient-to-br from-white to-blue-50/40',
  },
  green: {
    icon: 'bg-emerald-100 text-emerald-600',
    value: 'text-emerald-700',
    border: 'border-emerald-100',
    bg: 'bg-gradient-to-br from-white to-emerald-50/40',
  },
  purple: {
    icon: 'bg-violet-100 text-violet-600',
    value: 'text-violet-700',
    border: 'border-violet-100',
    bg: 'bg-gradient-to-br from-white to-violet-50/40',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
    border: 'border-amber-100',
    bg: 'bg-gradient-to-br from-white to-amber-50/40',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-600',
    value: 'text-rose-700',
    border: 'border-rose-100',
    bg: 'bg-gradient-to-br from-white to-rose-50/40',
  },
};

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: SummaryCardProps) {
  const p = palette[color];
  return (
    <div className={`${p.bg} rounded-2xl border ${p.border} shadow-sm p-5 flex flex-col gap-3`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={`text-2xl font-bold ${p.value}`}>{value}</p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
