import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNative } from './platform';

export async function hapticTap() {
  if (isNative()) {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
  } else {
    try { navigator.vibrate?.(30); } catch {}
  }
}

export async function hapticSuccess() {
  if (isNative()) {
    try { await Haptics.notification({ type: NotificationType.Success }); } catch {}
  } else {
    try { navigator.vibrate?.([30, 60, 80]); } catch {}
  }
}

export async function hapticError() {
  if (isNative()) {
    try { await Haptics.notification({ type: NotificationType.Error }); } catch {}
  } else {
    try { navigator.vibrate?.([80, 60, 80]); } catch {}
  }
}
