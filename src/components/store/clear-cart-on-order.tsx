'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart/context';

export function ClearCartOnOrder() {
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
  }, [clear]);

  return null;
}
