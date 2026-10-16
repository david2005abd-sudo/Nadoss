export interface CartItem {
  productId: string;
  name: string;
  priceIqd: number;
  quantity: number;
  image?: string;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  tenantSlug: string;
}

export type CartAction =
  | { type: 'ADD'; item: Omit<CartItem, 'quantity'>; quantity: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; state: CartState };
