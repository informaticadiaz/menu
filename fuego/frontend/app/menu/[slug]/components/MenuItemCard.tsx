import type { MenuItem } from '@/lib/types';

export default function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <li className="flex min-w-0 gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="h-20 w-20 flex-shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
        />
      ) : (
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-xs font-semibold uppercase tracking-[0.14em] text-orange-800 sm:h-24 sm:w-24">
          Fuego
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="break-words text-base font-semibold leading-5 text-stone-950">{item.name}</p>
          {item.description && (
            <p className="break-words text-sm leading-5 text-stone-600">{item.description}</p>
          )}
        </div>
        <p className="text-base font-semibold text-orange-800">${item.price}</p>
      </div>
    </li>
  );
}
