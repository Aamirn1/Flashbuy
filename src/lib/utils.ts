import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a Prisma Json field.
 * Prisma auto-parses Json fields into JS objects, but sometimes
 * the data might still be a string (e.g., from raw queries).
 */
export function parseJsonField<T = unknown>(value: unknown, fallback: T = [] as T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value || '[]');
    } catch {
      return fallback;
    }
  }
  return value as T;
}

/** Convert Prisma Decimal fields to plain numbers for JSON serialization */
export function decimalToNumber<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && 'toNumber' in (obj as object)) {
    return (obj as { toNumber: () => number }).toNumber() as T;
  }
  return obj;
}

/** Recursively convert all Decimal-like fields in an object to numbers */
export function serializeData<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(serializeData) as T;
  if (typeof obj === 'object') {
    // Check if it's a Prisma Decimal (has toNumber method)
    if ('toNumber' in (obj as object) && typeof (obj as { toNumber: unknown }).toNumber === 'function') {
      return (obj as { toNumber: () => number }).toNumber() as T;
    }
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeData(value);
    }
    return result as T;
  }
  return obj;
}
