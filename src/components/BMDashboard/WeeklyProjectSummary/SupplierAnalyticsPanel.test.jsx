import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { autoTable } from 'jspdf-autotable';
import SupplierAnalyticsPanel from './SupplierAnalyticsPanel';
const mocks = vi.hoisted(() => ({ role: 'Administrator', save: vi.fn() }));
vi.mock('axios', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
vi.mock('react-redux', () => ({
  useSelector: callback => callback({ auth: { user: { role: mocks.role } } }),
}));
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function PDF() {
    this.text = vi.fn();
    this.save = mocks.save;
  }),
}));
vi.mock('jspdf-autotable', () => ({ autoTable: vi.fn() }));
vi.mock('recharts', () => {
  const Container = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Container,
    LineChart: Container,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    CartesianGrid: () => null,
  };
});
const records = [80, 90, 100].map((value, i) => ({
  supplierName: 'A',
  endDate: `2026-0${i + 1}-28`,
  onTimeDeliveryPercentage: value,
}));
const mount = () =>
  render(<SupplierAnalyticsPanel projectId="all" startDate="2026-01-01" endDate="2026-12-31" />);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.role = 'Administrator';
  axios.get.mockResolvedValue({ data: { records, causes: [] } });
});
describe('supplier analytics panel', () => {
  it('updates period analytics and exports the selected report to PDF', async () => {
    mount();
    await screen.findByText('Low (17.25/100)');
    fireEvent.change(screen.getByLabelText('Reporting period'), { target: { value: 'quarterly' } });
    expect(screen.getAllByText('Insufficient history').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Export PDF'));
    expect(autoTable.mock.calls[0][1].body).toHaveLength(1);
    expect(autoTable.mock.calls[0][1].body[0][3]).toBe('2026-Q1');
    expect(mocks.save).toHaveBeenCalledWith('supplier-analytics.pdf');
  });
  it('saves admin tags and displays the persisted response', async () => {
    axios.put.mockResolvedValue({ data: { supplierKey: 'name:A', tags: ['Delayed Shipments'] } });
    mount();
    fireEvent.click(await screen.findByText('Edit tags'));
    fireEvent.change(screen.getByLabelText(/Comma-separated tags/), {
      target: { value: 'Delayed Shipments' },
    });
    fireEvent.click(screen.getByText('Save tags'));
    await screen.findByText('Delayed Shipments');
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/root-causes'), {
      supplierKey: 'name:A',
      tags: ['Delayed Shipments'],
    });
  });
  it('shows read-only tags for volunteers', async () => {
    mocks.role = 'Volunteer';
    mount();
    await screen.findByText('Low (17.25/100)');
    expect(screen.queryByText('Edit tags')).toBeNull();
  });
  it('shows history loading errors', async () => {
    axios.get.mockRejectedValue(new Error('offline'));
    mount();
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Unable to load'));
  });
});
