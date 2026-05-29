import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 64; // px to pull before triggering
const MAX_PULL = 90;  // max visual pull distance

export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      // Only activate pull-to-refresh when scrolled to top
      if (window.scrollY > 5) return;
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || startYRef.current === null || refreshing) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy < 0) { pullingRef.current = false; return; }
      // Dampen pull with square-root feel
      const clamped = Math.min(MAX_PULL, dy * 0.5);
      setPullDistance(clamped);
      if (dy > 10) e.preventDefault();
    };

    const onTouchEnd = async () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      if (pullDistance >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPullDistance(THRESHOLD * 0.7);
        try { await onRefresh(); } catch {}
        setRefreshing(false);
      }
      setPullDistance(0);
      startYRef.current = null;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDistance, refreshing, onRefresh]);

  return { pullDistance, refreshing };
}
