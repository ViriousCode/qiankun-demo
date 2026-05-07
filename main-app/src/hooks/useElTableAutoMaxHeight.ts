import { computed, onBeforeUnmount, onMounted, ref, type Ref, watch } from 'vue';

type MaybeEl = HTMLElement | null | undefined;

export interface UseElTableAutoMaxHeightOptions {
  /** The card/container whose height we must not exceed (typically `.page-card`). */
  containerRef: Ref<MaybeEl>;
  /**
   * Elements that take vertical space inside the container (filters/toolbars/pagination).
   * Their heights will be subtracted from the container height.
   */
  subtractRefs?: Ref<MaybeEl>[];
  /** Extra pixels to subtract for gaps/padding/margins. */
  extraOffset?: number;
  /** A lower bound to avoid 0/negative heights during initial layout. */
  minHeight?: number;
}

export function useElTableAutoMaxHeight(options: UseElTableAutoMaxHeightOptions) {
  const { containerRef, subtractRefs = [], extraOffset = 16, minHeight = 240 } = options;

  const rawMaxHeight = ref<number>(minHeight);

  const toPx = (v: string) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const outerHeightWithMargins = (el: HTMLElement) => {
    const rectH = el.getBoundingClientRect().height;
    const style = window.getComputedStyle(el);
    return rectH + toPx(style.marginTop) + toPx(style.marginBottom);
  };

  const recalc = () => {
    const container = containerRef.value;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerStyle = window.getComputedStyle(container);
    const paddingTop = toPx(containerStyle.paddingTop);
    const paddingBottom = toPx(containerStyle.paddingBottom);
    const containerInnerH = containerRect.height - paddingTop - paddingBottom;

    const subtractH = subtractRefs.reduce((sum, r) => {
      const el = r.value;
      if (!el) return sum;
      return sum + outerHeightWithMargins(el);
    }, 0);

    const next = Math.floor(containerInnerH - subtractH - extraOffset);
    rawMaxHeight.value = Number.isFinite(next) ? Math.max(minHeight, next) : minHeight;
  };

  let ro: ResizeObserver | null = null;
  const observed = new Set<Element>();

  const syncObservers = () => {
    if (!ro) return;
    ro.disconnect();
    observed.clear();

    const container = containerRef.value;
    if (container) {
      ro.observe(container);
      observed.add(container);
    }
    subtractRefs.forEach((r) => {
      const el = r.value;
      if (!el) return;
      ro?.observe(el);
      observed.add(el);
    });
  };

  const scheduleRecalc = (() => {
    let raf = 0;
    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        recalc();
      });
    };
  })();

  onMounted(() => {
    ro = new ResizeObserver(() => scheduleRecalc());

    // Observe current elements and keep observers updated when refs become available.
    syncObservers();
    scheduleRecalc();

    window.addEventListener('resize', scheduleRecalc, { passive: true });
  });

  watch(
    () => [containerRef.value, ...subtractRefs.map((r) => r.value)],
    () => {
      syncObservers();
      scheduleRecalc();
    }
  );

  onBeforeUnmount(() => {
    window.removeEventListener('resize', scheduleRecalc);
    ro?.disconnect();
    ro = null;
    observed.clear();
  });

  const tableMaxHeight = computed(() => rawMaxHeight.value);

  return {
    tableMaxHeight
  };
}
