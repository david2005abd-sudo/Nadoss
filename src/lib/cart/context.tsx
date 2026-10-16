'use client';

import * as React from 'react';
import type { CartItem, CartState, CartAction } from './types';

const STORAGE_PREFIX = 'nados_cart_';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.item.productId
              ? { ...i, quantity: Math.min(i.quantity + action.quantity, i.stock) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.item, quantity: Math.min(action.quantity, action.item.stock) },
        ],
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: Math.min(action.quantity, i.stock) }
            : i
        ),
      };
    }
    case 'CLEAR':
      return { ...state, items: [] };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({
  tenantSlug,
  children,
}: {
  tenantSlug: string;
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(cartReducer, {
    items: [],
    tenantSlug,
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + tenantSlug);
      if (raw) {
        const parsed = JSON.parse(raw) as CartState;
        if (parsed.tenantSlug === tenantSlug && Array.isArray(parsed.items)) {
          dispatch({ type: 'HYDRATE', state: parsed });
        }
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, [tenantSlug]);

  // Persist to localStorage
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_PREFIX + tenantSlug, JSON.stringify(state));
    } catch {
      // storage full / disabled
    }
  }, [state, tenantSlug, hydrated]);

  const value = React.useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = state.items.reduce((sum, i) => sum + i.priceIqd * i.quantity, 0);
    return {
      state,
      dispatch,
      itemCount,
      subtotal,
      addItem: (item, quantity = 1) => {
        dispatch({ type: 'ADD', item, quantity });
        setIsOpen(true);
      },
      removeItem: (productId) => dispatch({ type: 'REMOVE', productId }),
      updateQuantity: (productId, quantity) =>
        dispatch({ type: 'UPDATE_QTY', productId, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [state, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
