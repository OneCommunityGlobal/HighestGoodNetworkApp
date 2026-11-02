import axios from 'axios';
import { render, screen } from '@testing-library/react';
import TeamLocations from './TeamLocations';

const testState = vi.hoisted(() => ({ darkMode: false }));

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('react-redux', () => ({
  useSelector: selector =>
    selector({ auth: { user: { role: 'Volunteer' } }, theme: { darkMode: testState.darkMode } }),
}));
vi.mock('react-leaflet', async () => {
  const { forwardRef } = await import('react');
  return {
    MapContainer: forwardRef(({ children }, ref) => <div ref={ref}>{children}</div>),
    TileLayer: () => null,
    useMapEvents: () => ({ getZoom: () => 3 }),
  };
});
vi.mock('./TestSafeMarkerCluster', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('./AddOrEditPopup', () => ({ default: () => null }));
vi.mock('./ListUsersPopUp', () => ({ default: () => null }));
vi.mock('./MarkerPopup', () => ({ default: () => null }));
vi.mock('./TeamLocationsTable', () => ({ default: () => null }));

describe('Team Locations country counts', () => {
  afterEach(() => {
    vi.clearAllMocks();
    testState.darkMode = false;
  });

  it('shows the all-time and active counts from the map locations response', async () => {
    axios.get.mockResolvedValue({
      data: { users: [], mUsers: [], countryCounts: { allTime: 76, active: 23 } },
    });

    render(<TeamLocations />);

    const counts = await screen.findByLabelText('Volunteer country counts');
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Total Countries:0');
    expect(counts).toHaveTextContent('All-time contributing countries: 76');
    expect(counts).toHaveTextContent('Currently active countries: 23');
  });

  it('shows the counts in dark mode', async () => {
    testState.darkMode = true;
    axios.get.mockResolvedValue({
      data: { users: [], mUsers: [], countryCounts: { allTime: 76, active: 23 } },
    });

    render(<TeamLocations />);

    const counts = await screen.findByLabelText('Volunteer country counts');
    expect(counts).toHaveTextContent('All-time contributing countries: 76');
    expect(counts).toHaveTextContent('Currently active countries: 23');
  });

  it('keeps the two labels visible when the backend has not supplied counts', async () => {
    axios.get.mockResolvedValue({ data: { users: [], mUsers: [] } });

    render(<TeamLocations />);

    const counts = await screen.findByLabelText('Volunteer country counts');
    expect(counts).toHaveTextContent('All-time contributing countries: —');
    expect(counts).toHaveTextContent('Currently active countries: —');
  });
});
