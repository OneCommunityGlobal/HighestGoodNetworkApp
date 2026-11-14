import { render } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { createProjectClusterIcon, MapViewportUpdater } from './ProjectMapPresentation';

const { map } = vi.hoisted(() => ({
  map: {
    invalidateSize: vi.fn(),
    getBoundsZoom: vi.fn(),
    setMinZoom: vi.fn(),
    getZoom: vi.fn(),
    setZoom: vi.fn(),
    panInsideBounds: vi.fn(),
    getContainer: vi.fn(() => document.createElement('div')),
  },
}));
vi.mock('react-leaflet', () => ({ useMap: () => map }));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('project map presentation', () => {
  it.each([
    ['#DE6A6A', '#DE6A6A'],
    ['#DE6A6A', '#6ACFDE'],
    ['invalid', '#E3D270'],
  ])('renders a count and status ring for %s and %s', (first, second) => {
    const icon = createProjectClusterIcon({
      getChildCount: () => 2,
      getAllChildMarkers: () => [first, second].map(fillColor => ({ options: { fillColor } })),
    });
    const element = icon.createIcon();
    expect(element.textContent).toBe('2');
    expect(icon.options.html).toContain('title="2 projects"');
    expect(icon.options.html).toContain('conic-gradient(');
    expect(icon.options.html).toContain(first === 'invalid' ? '#AAAAAA' : first);
    expect(icon.options.html).toContain(second);
    expect(icon.options.iconSize).toEqual([44, 44]);
  });

  it('fills the viewport on mount and resize without resetting a closer zoom', () => {
    let resize;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback) {
          resize = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    map.getBoundsZoom.mockReturnValue(4);
    map.getZoom.mockReturnValue(3);
    const { unmount } = render(<MapViewportUpdater />);
    expect(map.setMinZoom).toHaveBeenLastCalledWith(4);
    expect(map.setZoom).toHaveBeenCalledWith(4, { animate: false });
    map.setZoom.mockClear();
    map.getBoundsZoom.mockReturnValue(3);
    map.getZoom.mockReturnValue(8);
    resize();
    expect(map.setMinZoom).toHaveBeenLastCalledWith(3);
    expect(map.setZoom).not.toHaveBeenCalled();
    expect(map.panInsideBounds).toHaveBeenCalled();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
