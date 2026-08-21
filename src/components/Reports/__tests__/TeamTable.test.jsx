import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { TeamTable } from '../TeamTable';
import styles from '../TeamTable.module.css';

vi.mock('~/utils/permissions', () => ({ default: () => false }));
vi.mock('~/actions/weeklySummariesFilterAction', () => ({
  useUpdateFiltersWithIndividualCodesChangeMutation: () => [vi.fn()],
}));

describe('TeamTable', () => {
  it('applies fixed table layout and wrapping classes while keeping all columns', () => {
    const longTeamName = 'A'.repeat(200);

    render(
      <MemoryRouter>
        <TeamTable
          allTeams={[
            {
              _id: 'team-1',
              teamName: longTeamName,
              isActive: true,
              teamCode: 'X-XXX',
            },
          ]}
          auth={{ user: { role: 'Volunteer' } }}
          darkMode={false}
          refreshTeams={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('columnheader').map(header => header.textContent.trim())).toEqual([
      '#',
      'Team Name',
      'Active',
      'Team Code',
    ]);
    expect(screen.getByRole('table')).toHaveClass(styles['team-table']);
    expect(screen.getByRole('cell', { name: longTeamName })).toHaveClass(
      styles['team-name-cell'],
    );
  });
});
