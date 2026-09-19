import { useCallback, useEffect, useRef, useState } from 'react';

const useTableOverflow = refreshDependency => {
  const tableContainerRef = useRef(null);
  const topScrollbarRef = useRef(null);
  const scrollbarDragRef = useRef(null);
  const [tableOverflow, setTableOverflow] = useState({
    hasOverflow: false,
    showFade: false,
    scrollWidth: 0,
    clientWidth: 0,
    scrollLeft: 0,
    maxScrollLeft: 0,
    thumbWidth: 0,
    thumbLeft: 0,
  });

  const getTableScrollContainer = useCallback(
    () =>
      tableContainerRef.current?.querySelector('.table-responsive') || tableContainerRef.current,
    [],
  );

  const clampScrollLeft = useCallback((value, maxScrollLeft) => {
    if (value < 0) {
      return 0;
    }

    if (value > maxScrollLeft) {
      return maxScrollLeft;
    }

    return value;
  }, []);

  const updateTableOverflow = useCallback(() => {
    const scrollContainer = getTableScrollContainer();

    if (!scrollContainer) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    const hasOverflow = scrollWidth > clientWidth;
    const maxScrollLeft = Math.max(scrollWidth - clientWidth, 0);
    const trackWidth = topScrollbarRef.current?.clientWidth || clientWidth;
    const thumbWidth = hasOverflow ? Math.max((clientWidth / scrollWidth) * trackWidth, 32) : 0;
    const maxThumbLeft = Math.max(trackWidth - thumbWidth, 0);
    const thumbLeft =
      hasOverflow && maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * maxThumbLeft : 0;
    // Browser scroll math can differ slightly between the top scrollbar and table viewport.
    const scrollEndTolerance = 4;
    const remainingScroll = scrollWidth - clientWidth - scrollLeft;
    const isAtRightEdge = remainingScroll <= scrollEndTolerance;

    setTableOverflow({
      hasOverflow,
      showFade: hasOverflow && !isAtRightEdge,
      scrollWidth,
      clientWidth,
      scrollLeft,
      maxScrollLeft,
      thumbWidth,
      thumbLeft,
    });
  }, [getTableScrollContainer]);

  const setTableScrollLeft = useCallback(
    value => {
      const scrollContainer = getTableScrollContainer();

      if (!scrollContainer) {
        return;
      }

      const maxScrollLeft = Math.max(scrollContainer.scrollWidth - scrollContainer.clientWidth, 0);
      scrollContainer.scrollLeft = clampScrollLeft(value, maxScrollLeft);
      updateTableOverflow();
    },
    [clampScrollLeft, getTableScrollContainer, updateTableOverflow],
  );

  const handleScrollbarTrackPointerDown = useCallback(
    event => {
      if (event.target !== event.currentTarget || !tableOverflow.hasOverflow) {
        return;
      }

      const track = topScrollbarRef.current;

      if (!track) {
        return;
      }

      const rect = track.getBoundingClientRect();
      const maxThumbLeft = Math.max(track.clientWidth - tableOverflow.thumbWidth, 0);

      if (maxThumbLeft === 0) {
        return;
      }

      const nextThumbLeft = event.clientX - rect.left - tableOverflow.thumbWidth / 2;
      const scrollRatio = tableOverflow.maxScrollLeft / maxThumbLeft;
      setTableScrollLeft(nextThumbLeft * scrollRatio);
    },
    [setTableScrollLeft, tableOverflow],
  );

  const handleScrollbarThumbPointerDown = useCallback(
    event => {
      if (!tableOverflow.hasOverflow || event.button !== 0) {
        return;
      }

      const track = topScrollbarRef.current;
      const maxThumbLeft = track ? Math.max(track.clientWidth - tableOverflow.thumbWidth, 0) : 0;

      if (maxThumbLeft === 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      // Pointer capture keeps dragging stable even when the pointer leaves the thumb.
      event.currentTarget.setPointerCapture?.(event.pointerId);
      scrollbarDragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScrollLeft: tableOverflow.scrollLeft,
        scrollRatio: tableOverflow.maxScrollLeft / maxThumbLeft,
      };
    },
    [tableOverflow],
  );

  const handleScrollbarThumbPointerMove = useCallback(
    event => {
      const dragState = scrollbarDragRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const pointerDelta = event.clientX - dragState.startX;
      setTableScrollLeft(dragState.startScrollLeft + pointerDelta * dragState.scrollRatio);
    },
    [setTableScrollLeft],
  );

  const handleScrollbarThumbPointerUp = useCallback(event => {
    const dragState = scrollbarDragRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    scrollbarDragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const handleScrollbarKeyDown = useCallback(
    event => {
      if (!tableOverflow.hasOverflow) {
        return;
      }

      const step = 40;
      const pageStep = tableOverflow.clientWidth * 0.8;
      const keyScrollAmounts = {
        ArrowLeft: -step,
        ArrowRight: step,
        PageUp: -pageStep,
        PageDown: pageStep,
        Home: -tableOverflow.maxScrollLeft,
        End: tableOverflow.maxScrollLeft,
      };

      if (!Object.hasOwn(keyScrollAmounts, event.key)) {
        return;
      }

      event.preventDefault();

      if (event.key === 'Home') {
        setTableScrollLeft(0);
        return;
      }

      if (event.key === 'End') {
        setTableScrollLeft(tableOverflow.maxScrollLeft);
        return;
      }

      setTableScrollLeft(tableOverflow.scrollLeft + keyScrollAmounts[event.key]);
    },
    [setTableScrollLeft, tableOverflow],
  );

  useEffect(() => {
    const scrollContainer = getTableScrollContainer();

    if (!scrollContainer) {
      return undefined;
    }

    scrollContainer.addEventListener('scroll', updateTableOverflow);
    updateTableOverflow();

    return () => {
      scrollContainer.removeEventListener('scroll', updateTableOverflow);
    };
  }, [refreshDependency, getTableScrollContainer, updateTableOverflow]);

  useEffect(() => {
    const scrollContainer = getTableScrollContainer();
    const topScrollbar = topScrollbarRef.current;
    let resizeObserver;

    const handleResize = () => {
      window.requestAnimationFrame(updateTableOverflow);
    };

    updateTableOverflow();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    if (window.ResizeObserver && scrollContainer) {
      resizeObserver = new window.ResizeObserver(handleResize);
      resizeObserver.observe(scrollContainer);
      if (topScrollbar) {
        resizeObserver.observe(topScrollbar);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      resizeObserver?.disconnect();
    };
  }, [refreshDependency, getTableScrollContainer, tableOverflow.hasOverflow, updateTableOverflow]);

  return {
    tableContainerRef,
    topScrollbarRef,
    tableOverflow,
    handleScrollbarTrackPointerDown,
    handleScrollbarThumbPointerDown,
    handleScrollbarThumbPointerMove,
    handleScrollbarThumbPointerUp,
    handleScrollbarKeyDown,
  };
};

export default useTableOverflow;
