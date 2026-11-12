import { render, screen, within } from '@testing-library/react';
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
});
