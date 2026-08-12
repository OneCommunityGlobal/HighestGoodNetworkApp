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

  useEffect(() => {
    const targets = resolveScrollTargets(scrollTarget);
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
      const candidates = eventTarget ? [...new Set([eventTarget, ...targets])] : targets;
      const activeTarget = candidates.reduce(
        (currentTarget, target) =>
          getScrollTop(target) > getScrollTop(currentTarget) ? target : currentTarget,
        candidates[0],
      );

      activeTargetRef.current = activeTarget;
      setIsVisible(getScrollTop(activeTarget) > threshold);
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
    const target = activeTargetRef.current;
    if (!target) return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    target.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
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
