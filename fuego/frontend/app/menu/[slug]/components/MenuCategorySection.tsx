import type { MenuItem } from '@/lib/types';
import MenuItemCard from './MenuItemCard';

export default function MenuCategorySection({
  category,
  items,
}: {
  category: string;
  items: MenuItem[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="border-b border-stone-200 pb-2 text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
        {category}
      </h2>
      <ul className="space-y-3 sm:space-y-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}
