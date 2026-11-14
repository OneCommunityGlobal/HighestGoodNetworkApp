import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import GlobalVolunteerMap from '../GlobalVolunteerMap';

vi.mock('leaflet', () => ({
  default: { heatLayer: () => ({ addTo: () => {} }) },
}));
vi.mock('leaflet.heat', () => ({}));
vi.mock('leaflet/dist/leaflet.css', () => ({}));

// Render the tile layer as a plain element so the test can read which tiles the map asks for
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  TileLayer: ({ url, attribution, className }) => (
    <div
      data-testid="tile-layer"
      data-url={url}
      data-attribution={attribution}
      data-class={className}
    />
  ),
  CircleMarker: () => null,
  useMap: () => ({ removeLayer: () => {} }),
}));

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const locations = [
  { _id: { lat: 40.7, lng: -74 }, count: 3 },
  { lat: 51.5, lng: -0.1, count: 1 },
];

const renderTiles = darkMode => {
  const { unmount } = render(
    <GlobalVolunteerMap locations={locations} isLoading={false} darkMode={darkMode} />,
  );
  const tiles = screen.getByTestId('tile-layer');
  const result = {
    url: tiles.getAttribute('data-url'),
    attribution: tiles.getAttribute('data-attribution'),
    className: tiles.getAttribute('data-class') || '',
  };
  unmount();
  return result;
};

describe('Global Volunteer Network map tiles', () => {
  it('uses the OpenStreetMap tiles in dark mode instead of Stadia Maps', () => {
    const { url, attribution } = renderTiles(true);

    expect(url).toBe(OSM_TILE_URL);
    expect(attribution).toContain('OpenStreetMap');
    expect(attribution).not.toContain('Stadia');
  });

  it('darkens the tiles only in dark mode', () => {
    expect(renderTiles(true).className).toContain('volunteerMapDarkTiles');
    expect(renderTiles(false).className).toBe('');
  });

  it('keeps the same OpenStreetMap tiles in light mode', () => {
    const { url, attribution } = renderTiles(false);

    expect(url).toBe(OSM_TILE_URL);
    expect(attribution).toContain('OpenStreetMap');
  });

  it('never asks a tile server that needs an API key', () => {
    [true, false].forEach(darkMode => {
      const { url } = renderTiles(darkMode);
      expect(url).not.toMatch(/stadiamaps|cartocdn|api_key|apikey|access_token/i);
    });
  });

  it('shows a message instead of the map when there are no locations', () => {
    render(<GlobalVolunteerMap locations={[]} isLoading={false} darkMode />);

    expect(screen.getByText('No volunteer location data available')).toBeInTheDocument();
    expect(screen.queryByTestId('tile-layer')).not.toBeInTheDocument();
  });
});
