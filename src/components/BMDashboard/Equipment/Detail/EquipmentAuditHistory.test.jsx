import { render, screen, within } from '@testing-library/react';
import EquipmentAuditHistory from './EquipmentAuditHistory';

describe('EquipmentAuditHistory', () => {
  it('shows a clear empty state for equipment without recorded edits', () => {
    render(<EquipmentAuditHistory />);

    expect(screen.getByText('No detail edits recorded yet.')).toBeInTheDocument();
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
