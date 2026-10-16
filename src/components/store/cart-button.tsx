'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/context';

export function CartButton() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative flex items-center gap-2 rounded-lg bg-nados-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      aria-label="عرض السلة"
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden sm:inline">السلة</span>
      {itemCount > 0 && (
        <span className="absolute -top-2 -left-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-nados-danger px-1 text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </button>
  );
}
