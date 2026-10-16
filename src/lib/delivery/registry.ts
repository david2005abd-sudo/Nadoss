import type { DeliveryAdapter } from './types';
import { HiExpressAdapter } from './adapters/hi-express';
import { BoxyAdapter } from './adapters/boxy';
import { GalinaAdapter } from './adapters/galina';

const registry = new Map<string, DeliveryAdapter>();

function register(adapter: DeliveryAdapter) {
  registry.set(adapter.slug, adapter);
}

// Register all adapters
register(new HiExpressAdapter());
register(new BoxyAdapter());
register(new GalinaAdapter());

export function getAdapter(slug: string): DeliveryAdapter | null {
  return registry.get(slug) ?? null;
}

export function listAdapters(): DeliveryAdapter[] {
  return Array.from(registry.values());
}

export function hasAdapter(slug: string): boolean {
  return registry.has(slug);
}
