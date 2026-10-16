'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart/context';

export function ClearCartOnOrder({ tenantSlug }: { tenantSlug: string }) {
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    try {
      // Remove persisted state before the parent cart provider hydrates from localStorage.
      window.localStorage.removeItem(`nados_cart_${tenantSlug}`);
    } catch {
      // The in-memory cart is still cleared if storage is unavailable.
    }
    clear();
  }, [clear, tenantSlug]);

  return null;
}
