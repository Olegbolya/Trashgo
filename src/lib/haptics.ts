export async function hapticTap() {
  try { navigator.vibrate?.(30); } catch {}
}

export async function hapticSuccess() {
  try { navigator.vibrate?.([30, 60, 80]); } catch {}
}

export async function hapticError() {
  try { navigator.vibrate?.([80, 60, 80]); } catch {}
}
