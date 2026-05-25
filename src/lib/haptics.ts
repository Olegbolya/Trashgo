// Light haptic tap via navigator.vibrate (works in Android WebView / Capacitor)
export function hapticTap() {
  try { navigator.vibrate?.(30); } catch {}
}

export function hapticSuccess() {
  try { navigator.vibrate?.([30, 60, 80]); } catch {}
}

export function hapticError() {
  try { navigator.vibrate?.([80, 60, 80]); } catch {}
}
