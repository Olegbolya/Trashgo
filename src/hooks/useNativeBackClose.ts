import { useEffect, useRef } from 'react';
import { isNative } from '../lib/platform';
import { pushBackHandler } from '../lib/nativeBack';

/** On native, registers an Android back-button close handler while `isOpen` is true.
 *  The handler is automatically removed when `isOpen` becomes false or the component unmounts. */
export function useNativeBackClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || !isNative()) return;
    return pushBackHandler(() => onCloseRef.current());
  }, [isOpen]);
}
