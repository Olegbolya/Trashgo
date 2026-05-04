import type { ConfirmationResult } from 'firebase/auth';

// Module-scope: survives navigation within the same SPA session
let _pending: ConfirmationResult | null = null;

export const firebaseOtp = {
  set: (c: ConfirmationResult) => { _pending = c; },
  get: () => _pending,
  clear: () => { _pending = null; },
};
