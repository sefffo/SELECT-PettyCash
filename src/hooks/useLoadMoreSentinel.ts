import { useCallback, useEffect, useRef } from 'react';

interface UseLoadMoreSentinelOptions {
  enabled: boolean;
  onLoadMore: () => void;
}

/**
 * Near-bottom threshold (px) — prefetch the next page slightly before the user
 * actually hits the very bottom so loading feels seamless.
 */
const NEAR_BOTTOM_PX = 128;

interface ScrollMetrics {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
}

function isNearBottom(metrics: ScrollMetrics): boolean {
  return metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight <= NEAR_BOTTOM_PX;
}

/**
 * Finds the element that actually scrolls the sentinel into view — the nearest
 * ancestor with `overflow-y: auto/scroll/overlay`. This is the MUI Popover's
 * fixed-height notification container when the sentinel lives in
 * `NotificationsMenu`, and `null` for page flows that scroll the document.
 */
function findScrollContainer(node: HTMLElement): HTMLElement | null {
  let parent: HTMLElement | null = node.parentElement;
  while (parent && parent !== document.documentElement) {
    const { overflowY } = getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(overflowY)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Triggers `onLoadMore` when the real scroll container reaches the bottom.
 *
 * An IntersectionObserver rooted at a scrollable ancestor inside an MUI Popover
 * portal is not reliable across browsers, so this hook drives lazy loading from
 * the container's actual `scroll` position instead. The sentinel element is
 * still required as an anchor: the nearest scrollable ancestor is discovered
 * from it at mount, and a `scroll` listener is attached to that container.
 * If no scrollable ancestor exists (full-page notification list), the document
 * viewport is used.
 */
export function useLoadMoreSentinel({ enabled, onLoadMore }: UseLoadMoreSentinelOptions): {
  sentinelRef: (node: HTMLDivElement | null) => void;
} {
  const enabledRef = useRef(enabled);
  const onLoadMoreRef = useRef(onLoadMore);
  const measureRef = useRef<(() => ScrollMetrics) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
    onLoadMoreRef.current = onLoadMore;
  });

  const maybeLoadMore = useCallback(() => {
    if (!enabledRef.current) return;
    const measure = measureRef.current;
    if (measure && isNearBottom(measure())) {
      onLoadMoreRef.current();
    }
  }, []);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      measureRef.current = null;
      if (!node) return;

      const container = findScrollContainer(node);
      const onScroll = maybeLoadMore;

      if (container) {
        measureRef.current = () => ({
          clientHeight: container.clientHeight,
          scrollHeight: container.scrollHeight,
          scrollTop: container.scrollTop,
        });
        container.addEventListener('scroll', onScroll, { passive: true });
        cleanupRef.current = () => container.removeEventListener('scroll', onScroll);
      } else {
        const viewport = (document.scrollingElement ?? document.documentElement) as HTMLElement | null;
        measureRef.current = () => ({
          clientHeight: viewport?.clientHeight ?? 0,
          scrollHeight: viewport?.scrollHeight ?? 0,
          scrollTop: viewport?.scrollTop ?? 0,
        });
        window.addEventListener('scroll', onScroll, { passive: true });
        cleanupRef.current = () => window.removeEventListener('scroll', onScroll);
      }

      // Catch containers that are already at the bottom when the sentinel
      // mounts (e.g. the first page does not yet overflow the container).
      maybeLoadMore();
    },
    [maybeLoadMore],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  return { sentinelRef };
}