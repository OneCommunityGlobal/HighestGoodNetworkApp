import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ScrollToTopButton.module.css';

const getDefaultScrollTarget = () =>
  typeof document === 'undefined' ? null : document.getElementById('root');

const getScrollTop = target => {
  if (target !== window) return target.scrollTop;

  return Math.max(
    window.scrollY || 0,
    document.scrollingElement?.scrollTop || 0,
    document.documentElement?.scrollTop || 0,
    document.body?.scrollTop || 0,
  );
};

const resolveScrollTargets = scrollTarget => {
  const primaryTarget = (scrollTarget || getDefaultScrollTarget)();
  const targets = primaryTarget ? [primaryTarget] : [];

  if (!scrollTarget && typeof window !== 'undefined') targets.push(window);

  return [...new Set(targets)];
};

function ScrollToTopButton({ threshold = 100, scrollTarget }) {
  const [isVisible, setIsVisible] = useState(false);
  const activeTargetRef = useRef(null);
  const scrollTargetsRef = useRef([]);

  useEffect(() => {
    const targets = resolveScrollTargets(scrollTarget);
    scrollTargetsRef.current = targets;
    if (!targets.length) {
      activeTargetRef.current = null;
      setIsVisible(false);
      return undefined;
    }

    const updateVisibility = event => {
      const eventTarget =
        event?.target && event.target !== document && 'scrollTop' in event.target
          ? event.target
          : null;
      const eventTargetScrollTop = eventTarget ? getScrollTop(eventTarget) : 0;

      if (eventTargetScrollTop > threshold) {
        activeTargetRef.current = eventTarget;
        setIsVisible(true);
        return;
      }

      if (eventTarget && eventTarget === activeTargetRef.current) {
        setIsVisible(false);
        return;
      }

      const primaryTarget = targets.reduce(
        (currentTarget, target) =>
          getScrollTop(target) > getScrollTop(currentTarget) ? target : currentTarget,
        targets[0],
      );
      const primaryScrollTop = getScrollTop(primaryTarget);

      if (primaryScrollTop > threshold) {
        activeTargetRef.current = primaryTarget;
        setIsVisible(true);
        return;
      }

      if (!eventTarget) {
        activeTargetRef.current = primaryTarget;
        setIsVisible(false);
        return;
      }
    };

    updateVisibility();
    targets.forEach(target => {
      target.addEventListener('scroll', updateVisibility, { passive: true });
    });
    if (!scrollTarget) {
      document.addEventListener('scroll', updateVisibility, { capture: true, passive: true });
    }

    return () => {
      targets.forEach(target => {
        target.removeEventListener('scroll', updateVisibility);
      });
      if (!scrollTarget) {
        document.removeEventListener('scroll', updateVisibility, true);
      }
    };
  }, [scrollTarget, threshold]);

  const handleClick = () => {
    const candidates = new Set([...scrollTargetsRef.current, activeTargetRef.current]);

    if (!scrollTarget) {
      document.querySelectorAll('*').forEach(element => {
        if (element.scrollTop > 0) candidates.add(element);
      });
    }

    const connectedTargets = [...candidates].filter(
      target => target && (target === window || target.isConnected !== false),
    );
    const scrolledTargets = connectedTargets.filter(target => getScrollTop(target) > 0);
    const targets = scrolledTargets.length ? scrolledTargets : connectedTargets;

    if (!targets.length) return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scrollOptions = {
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    };

    targets.forEach(target => {
      if (typeof target.scrollTo === 'function') {
        target.scrollTo(scrollOptions);
      } else {
        target.scrollTop = 0;
      }
    });
  };

  if (!isVisible) return null;

  const button = (
    <button
      type="button"
      aria-label="Scroll to top"
      className={styles.scrollToTopButton}
      onClick={handleClick}
    >
      <FaArrowUp aria-hidden="true" focusable="false" />
    </button>
  );

  return typeof document === 'undefined' ? button : createPortal(button, document.body);
}

ScrollToTopButton.propTypes = {
  threshold: PropTypes.number,
  scrollTarget: PropTypes.func,
};

export default ScrollToTopButton;
