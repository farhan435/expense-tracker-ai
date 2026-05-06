import { Category } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';

interface CategoryBadgeProps {
  category: Category;
  showEmoji?: boolean;
}

export default function CategoryBadge({ category, showEmoji = true }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.bgColor} ${config.textColor} flex-shrink-0`}
    >
      {showEmoji && <span>{config.emoji}</span>}
      {category}
    </span>
  );
}
