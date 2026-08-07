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

  it('removes its scroll listener on unmount', () => {
    const removeEventListener = vi.spyOn(target, 'removeEventListener');
    const { unmount } = render(<ScrollToTopButton scrollTarget={resolveTarget} />);

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
