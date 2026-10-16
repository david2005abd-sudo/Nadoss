'use client';

import Link from 'next/link';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/context';
import { formatIQD } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function CartDrawer({ storeSlug }: { storeSlug: string }) {
  const { state, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />

      {/* Drawer */}
      <aside className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <ShoppingBag className="h-5 w-5" />
            السلة ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {state.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">سلتك فارغة</p>
            <Button variant="outline" onClick={closeCart}>
              تصفح المنتجات
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {state.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
                        لا صورة
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-nados-danger"
                        aria-label="إزالة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-nados-primary">
                      {formatIQD(item.priceIqd)}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
                        aria-label="تقليل"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                        aria-label="زيادة"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      {item.quantity >= item.stock && (
                        <span className="text-xs text-amber-600">الحد الأقصى {item.stock}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-gray-100 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="text-lg font-bold text-gray-900">{formatIQD(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500">تُحتسب رسوم التوصيل في صفحة الدفع</p>
              <Link href={`/store/${storeSlug}/checkout`} onClick={closeCart}>
                <Button className="w-full" size="lg">
                  إتمام الطلب
                </Button>
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
