import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import ScrollToTopButton from '../ScrollToTopButton';

describe('ScrollToTopButton', () => {
  let target;
  let resolveTarget;

  beforeEach(() => {
    target = document.createElement('div');
    target.scrollTo = vi.fn();
    Object.defineProperty(target, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    document.body.appendChild(target);
    resolveTarget = () => target;

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });
    window.scrollTo = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  afterEach(() => {
    target.remove();
    window.scrollY = 0;
    vi.restoreAllMocks();
  });

  it('is hidden through the threshold and appears above it', () => {
    render(<ScrollToTopButton scrollTarget={resolveTarget} />);

    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();

    target.scrollTop = 100;
    fireEvent.scroll(target);
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();

    target.scrollTop = 101;
    fireEvent.scroll(target);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
  });

  it('hides again when scrolling back above the threshold', () => {
    target.scrollTop = 301;
    render(<ScrollToTopButton scrollTarget={resolveTarget} />);

    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    target.scrollTop = 100;
    fireEvent.scroll(target);
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('uses an accessible native button and smoothly scrolls to the top', () => {
    target.scrollTop = 301;
    render(<ScrollToTopButton scrollTarget={resolveTarget} />);

    const button = screen.getByRole('button', { name: /scroll to top/i });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');

    fireEvent.click(button);
    expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('uses automatic scrolling when reduced motion is preferred', () => {
    window.matchMedia.mockReturnValue({ matches: true });
    target.scrollTop = 301;
    render(<ScrollToTopButton scrollTarget={resolveTarget} />);

    fireEvent.click(screen.getByRole('button', { name: /scroll to top/i }));
    expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('detects document scrolling when the default root target is not scrolling', () => {
    const root = document.createElement('div');
    root.id = 'root';
    root.scrollTo = vi.fn();
    Object.defineProperty(root, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    document.body.appendChild(root);
    window.scrollY = 301;

    render(<ScrollToTopButton />);

    fireEvent.click(screen.getByRole('button', { name: /scroll to top/i }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(root.scrollTo).not.toHaveBeenCalled();

    root.remove();
  });

  it('detects and scrolls a nested page container', () => {
    const root = document.createElement('div');
    root.id = 'root';
    Object.defineProperty(root, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    const nestedScroller = document.createElement('div');
    nestedScroller.scrollTo = vi.fn();
    Object.defineProperty(nestedScroller, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 301,
    });
    root.appendChild(nestedScroller);
    document.body.appendChild(root);

    render(<ScrollToTopButton />);
    fireEvent.scroll(nestedScroller);
    fireEvent.click(screen.getByRole('button', { name: /scroll to top/i }));

    expect(nestedScroller.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    root.remove();
  });

  it('ignores unrelated nested scroll events after the page scroller passes the threshold', () => {
    const root = document.createElement('div');
    root.id = 'root';
    Object.defineProperty(root, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    const pageScroller = document.createElement('div');
    pageScroller.scrollTo = vi.fn();
    Object.defineProperty(pageScroller, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 101,
    });
    const widgetScroller = document.createElement('div');
    Object.defineProperty(widgetScroller, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    root.append(pageScroller, widgetScroller);
    document.body.appendChild(root);

    render(<ScrollToTopButton />);
    fireEvent.scroll(pageScroller);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    fireEvent.scroll(widgetScroller);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /scroll to top/i }));
    expect(pageScroller.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    root.remove();
  });

  it('re-evaluates the page scroller before scrolling to the top', () => {
    const root = document.createElement('div');
    root.id = 'root';
    Object.defineProperty(root, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    const initialScroller = document.createElement('div');
    initialScroller.scrollTo = vi.fn();
    Object.defineProperty(initialScroller, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 101,
    });
    root.appendChild(initialScroller);
    document.body.appendChild(root);

    render(<ScrollToTopButton />);
    fireEvent.scroll(initialScroller);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    initialScroller.scrollTop = 0;
    const currentScroller = document.createElement('div');
    currentScroller.scrollTo = vi.fn();
    Object.defineProperty(currentScroller, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 101,
    });
    root.appendChild(currentScroller);
    fireEvent.click(screen.getByRole('button', { name: /scroll to top/i }));

    expect(currentScroller.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(initialScroller.scrollTo).not.toHaveBeenCalled();

    root.remove();
  });

  it('hides when the active nested page scroller returns within the threshold', () => {
    const root = document.createElement('div');
    root.id = 'root';
    Object.defineProperty(root, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    const pageScroller = document.createElement('div');
    Object.defineProperty(pageScroller, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 101,
    });
    root.appendChild(pageScroller);
    document.body.appendChild(root);

    render(<ScrollToTopButton />);
    fireEvent.scroll(pageScroller);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    pageScroller.scrollTop = 100;
    fireEvent.scroll(pageScroller);
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();

    root.remove();
  });

  it('hides at the top even when another container retains a stale scroll position', () => {
    const root = document.createElement('div');
    root.id = 'root';
    Object.defineProperty(root, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 101,
    });
    const pageScroller = document.createElement('div');
    Object.defineProperty(pageScroller, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 101,
    });
    root.appendChild(pageScroller);
    document.body.appendChild(root);

    render(<ScrollToTopButton />);
    fireEvent.scroll(pageScroller);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    pageScroller.scrollTop = 0;
    fireEvent.scroll(pageScroller);
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();

    root.remove();
  });

  it('removes its scroll listener on unmount', () => {
    const removeEventListener = vi.spyOn(target, 'removeEventListener');
    const { unmount } = render(<ScrollToTopButton scrollTarget={resolveTarget} />);

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
