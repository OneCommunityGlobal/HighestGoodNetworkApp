import { useEffect } from 'react';
import { divIcon } from 'leaflet';
import { useMap } from 'react-leaflet';
import styles from './InteractiveMap.module.css';

export function createProjectClusterIcon(cluster) {
  // CircleMarker fill colors already encode project status, including unknown statuses.
  const colors = new Map();
  cluster.getAllChildMarkers().forEach(marker => {
    const color = /^#[0-9a-f]{6}$/i.test(marker.options.fillColor)
      ? marker.options.fillColor
      : '#AAAAAA';
    colors.set(color, (colors.get(color) || 0) + 1);
  });
  const count = cluster.getChildCount();
  let offset = 0;
  const stops = Array.from(colors, ([color, total]) => {
    const start = offset;
    offset += (total / count) * 100;
    return `${color} ${start}% ${offset}%`;
  });
  return divIcon({
    className: styles.projectCluster,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<div style="background:conic-gradient(${stops.join(
      ',',
    )})" title="${count} projects"><span>${count}</span></div>`,
  });
}

export function MapViewportUpdater() {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      map.invalidateSize({ pan: false });
      // Reset the floor so a narrower container can lower it again.
      map.setMinZoom(2);
      // Fit *inside* the projected world so neither axis can expose untiled space.
      const minimum = Math.max(
        2,
        map.getBoundsZoom(
          [
            [-85, -180],
            [85, 180],
          ],
          true,
        ),
      );
      map.setMinZoom(minimum);
      if (map.getZoom() < minimum) map.setZoom(minimum, { animate: false });
      map.panInsideBounds(
        [
          [-85, -180],
          [85, 180],
        ],
        { animate: false },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
