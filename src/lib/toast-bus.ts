// src/lib/toast-bus.ts
export type ToastFn = (opts: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}) => void;

// internal reference to the active toast function
let _toast: ToastFn = () => {};

export const setToast = (fn: ToastFn) => {
  _toast = fn || (() => {});
};

export const showToast: ToastFn = (opts) => {
  try {
    _toast?.(opts);
  } catch {
    // noop – avoids crashing if bridge isn't mounted yet
  }
};