import { fireEvent, render, screen, within } from '@testing-library/react';
import EquipmentAuditHistory from './EquipmentAuditHistory';

describe('EquipmentAuditHistory', () => {
  it('shows a clear empty state for equipment without recorded edits', () => {
    render(<EquipmentAuditHistory />);

    expect(screen.getByText('No detail edits recorded yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });

  it('downloads the displayed audit rows with spreadsheet-safe values', async () => {
    const createObjectURL = vi.fn(() => 'blob:equipment-audit');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function() {
      expect(this.download).toBe('equipment-example-audit-history.csv');
    });
    vi.useFakeTimers({ toFake: ['setTimeout'] });

    try {
      render(
        <EquipmentAuditHistory
          equipmentId="example"
          entries={[
            {
              _id: 'first',
              timestamp: '2026-11-26T16:00:00.000Z',
              actor: 'user-id',
              field: 'condition',
              oldValue: null,
              newValue: 'Used',
            },
            {
              _id: 'second',
              timestamp: '2026-11-26T17:00:00.000Z',
              actor: { firstName: 'Sai', lastName: 'Manojna' },
              field: 'equipmentClass',
              oldValue: 'Crane, "Large"',
              newValue: ' =1+1',
            },
          ]}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

      expect(click).toHaveBeenCalledOnce();
      const [[blob]] = createObjectURL.mock.calls;
      const csv = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(blob);
      });
      expect(blob.type).toBe('text/csv;charset=utf-8');
      expect(csv).toBe(
        [
          '"Timestamp (UTC)","User","Field","Old value","New value"',
          `"2026-11-26T17:00:00.000Z","Sai Manojna","Class","Crane, ""Large""","' =1+1"`,
          '"2026-11-26T16:00:00.000Z","user-id","Condition","","Used"',
        ].join('\r\n'),
      );
      vi.runOnlyPendingTimers();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:equipment-audit');
    } finally {
      vi.useRealTimers();
      vi.unstubAllGlobals();
      click.mockRestore();
    }
  });

  it('uses available project names and falls back to stored IDs', () => {
    render(
      <EquipmentAuditHistory
        projectOptions={[{ value: 'current-project-id', label: 'Community Center' }]}
        entries={[
          {
            _id: 'project-change',
            timestamp: '2026-11-26T17:00:00.000Z',
            field: 'project',
            oldValue: 'former-project-id',
            newValue: 'current-project-id',
          },
        ]}
      />,
    );

    expect(screen.getByRole('cell', { name: 'Project' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'former-project-id' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Community Center' })).toBeInTheDocument();
  });

  it('shows the user and field values with the most recent edit first', () => {
    const timestamp = '2026-11-26T17:00:00.000Z';
    render(
      <EquipmentAuditHistory
        entries={[
          {
            _id: 'first',
            timestamp: '2026-11-26T16:00:00.000Z',
            field: 'equipmentClass',
            oldValue: null,
            newValue: 'Tools',
          },
          {
            _id: 'second',
            timestamp,
            actor: { firstName: 'Sai', lastName: 'Manojna' },
            field: 'condition',
            oldValue: 'Used',
            newValue: 'Refurbished',
          },
        ]}
      />,
    );

    const [, latest, previous] = screen.getAllByRole('row');
    expect(within(latest).getByText(new Date(timestamp).toLocaleString())).toHaveAttribute(
      'datetime',
      timestamp,
    );
    expect(within(latest).getByText('Sai Manojna')).toBeInTheDocument();
    expect(within(latest).getByText('Condition')).toBeInTheDocument();
    expect(within(latest).getByText('Used')).toBeInTheDocument();
    expect(within(latest).getByText('Refurbished')).toBeInTheDocument();
    expect(within(previous).getByText('Tools')).toBeInTheDocument();
  });
});
