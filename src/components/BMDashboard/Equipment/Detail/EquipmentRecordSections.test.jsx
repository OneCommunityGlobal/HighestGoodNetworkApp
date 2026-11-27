import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import EquipmentRecordSections from './EquipmentRecordSections';

describe('EquipmentRecordSections', () => {
  it('shows existing updates and purchases on the detail page, newest first', () => {
    render(
      <EquipmentRecordSections
        equipment={{
          updateRecord: [
            { date: '2026-01-01', condition: 'Good', createdBy: { firstName: 'Alex' } },
            { date: '2026-02-01', condition: 'Needs Repair', createdBy: { firstName: 'Sam' } },
          ],
          purchaseRecord: [
            {
              date: '2026-03-01',
              status: 'Pending',
              priority: 'High',
              requestedBy: { firstName: 'Lee', lastName: 'Chen' },
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Updates (2)')).toBeInTheDocument();
    expect(screen.getByText('Purchases (1)')).toBeInTheDocument();
    const updateRows = screen.getAllByRole('row');
    expect(within(updateRows[1]).getByText('Needs Repair')).toBeInTheDocument();
    expect(within(updateRows[2]).getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Lee Chen')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows empty states when no records are available', () => {
    render(<EquipmentRecordSections equipment={{}} />);
    expect(screen.getByText('Updates (0)')).toBeInTheDocument();
    expect(screen.getByText('No updates recorded.')).toBeInTheDocument();
    expect(screen.getByText('Purchases (0)')).toBeInTheDocument();
    expect(screen.getByText('No purchases recorded.')).toBeInTheDocument();
  });

  it('edits the correct update when the records are sorted newest first', async () => {
    const patch = vi.spyOn(axios, 'patch').mockResolvedValue({});
    const onSaved = vi.fn();
    const date = '2026-02-01T00:00:00.000Z';
    try {
      render(
        <EquipmentRecordSections
          equipment={{
            _id: 'equipment-id',
            updateRecord: [
              { date: '2026-01-01T00:00:00.000Z', condition: 'Good' },
              { date, condition: 'Needs Repair' },
            ],
          }}
          onSaved={onSaved}
        />,
      );
      const [latestUpdate] = screen.getAllByRole('button', { name: 'Edit update', hidden: true });
      fireEvent.click(latestUpdate);
      fireEvent.change(screen.getByLabelText('Condition'), { target: { value: 'Out of Order' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
      expect(patch).toHaveBeenCalledWith(
        expect.stringContaining('/equipment-id/records/updates/1'),
        {
          condition: 'Out of Order',
          original: { condition: 'Needs Repair', date },
        },
      );
    } finally {
      patch.mockRestore();
    }
  });
});
