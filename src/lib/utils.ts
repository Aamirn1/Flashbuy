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
