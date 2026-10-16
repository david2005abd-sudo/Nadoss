'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/lib/cart/context';
import { Button } from '@/components/ui/button';

interface Props {
  product: {
    id: string;
    name: string;
    priceIqd: number;
    stock: number;
    image?: string;
  };
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function AddToCartButton({ product, size = 'default', className }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const disabled = product.stock <= 0;

  function handleAdd() {
    if (disabled) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        priceIqd: product.priceIqd,
        stock: product.stock,
        image: product.image,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled}
      size={size}
      className={className}
      variant={added ? 'secondary' : 'default'}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          تمت الإضافة
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          {disabled ? 'غير متوفر' : 'أضف إلى السلة'}
        </>
      )}
    </Button>
  );
}
