import type { MenuItem } from '@/lib/types';

export default function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <li className="flex gap-3 rounded-lg border p-3 sm:p-4">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="h-20 w-20 flex-shrink-0 rounded-md object-cover sm:h-24 sm:w-24"
        />
      ) : (
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-2xl sm:h-24 sm:w-24">
          🍽️
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-base font-medium">{item.name}</p>
          {item.description && (
            <p className="text-sm text-gray-500">{item.description}</p>
          )}
        </div>
        <p className="text-base font-semibold">${item.price}</p>
      </div>
    </li>
  );
}
