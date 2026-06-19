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
    <section className="space-y-3">
      <h2 className="text-lg font-semibold sm:text-xl">{category}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}
