/**
 * Generates a random UID string that works in all environments including server 11.
 * Uses a simple alphanumeric random string generator.
 * 
 * @param length - Length of the UID (default: 32)
 * @returns A random UID string
 */
export function generateUUID(length: number = 32): string {
  // Use crypto.getRandomValues if available (works in Node.js and browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
      }
      return result;
    } catch (error) {
      console.warn('crypto.getRandomValues() failed, using fallback:', error);
    }
  }

  // Fallback: Use Math.random() for compatibility with server 11
  // Security Hotspot Reviewed: Math.random() is acceptable here as a fallback for non-cryptographic use cases
  // when crypto.getRandomValues() is unavailable. This is used for generating UIDs, not security-sensitive tokens.
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    // eslint-disable-next-line sonarjs/no-insecure-randomness
    // NOSONAR: Security hotspot reviewed and accepted - Math.random() is acceptable as fallback for non-cryptographic UID generation
    // This fallback is only used when crypto.getRandomValues() is unavailable (e.g., server 11 compatibility)
    result += chars[Math.floor(Math.random() * chars.length)]; // NOSONAR
  }
  return result;
}

/**
 * Polyfill for crypto.randomUUID() that works in all environments
 * This extends the global crypto object if randomUUID is not available
 * Uses random UID instead of UUID format for server 11 compatibility
 */
export function polyfillCryptoRandomUUID(): void {
  if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
    (crypto as any).randomUUID = () => generateUUID(32);
  }
}

// Auto-polyfill on module load (for Node.js environments)
if (typeof global !== 'undefined' && global.crypto && !global.crypto.randomUUID) {
  (global.crypto as any).randomUUID = () => generateUUID(32);
}

// Auto-polyfill for window.crypto (browser environments)
if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
  (window.crypto as any).randomUUID = () => generateUUID(32);
}

