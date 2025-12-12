/**
 * Vitest setup file - runs before all tests
 */

import { vi } from 'vitest'

// Store original console.warn
const originalWarn = console.warn

// Suppress API response validation warnings during tests
// These occur because mock data doesn't include all schema fields
console.warn = (...args: unknown[]) => {
  const message = args[0]
  if (typeof message === 'string' && message.includes('API response validation warning')) {
    return // Suppress validation warnings from parseArraySafe
  }
  originalWarn.apply(console, args)
}
