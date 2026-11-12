/* Version 1.0.0 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import TeamStats from '../TeamStats/TeamStats';
import AnniversaryCelebrated from '../AnniversaryCelebrated/AnniversaryCelebrated';

vi.mock('axios');

describe('missing organization statistics', () => {
  it.each([undefined, null, {}, { inTeam: { count: 1 } }])(
    'shows an empty team section for incomplete statistics: %s',
    async usersInTeamStats => {
      axios.get.mockResolvedValue({ data: { count: 0 } });
      render(<TeamStats usersInTeamStats={usersInTeamStats} />);
      expect(
        await screen.findByText('No team data available for this period.'),
      ).toBeInTheDocument();
    },
  );

  it.each([undefined, null, {}, { '6Months': { users: [] } }])(
    'shows an empty anniversary section for incomplete statistics: %s',
    data => {
      render(
        <MemoryRouter>
          <AnniversaryCelebrated data={data} />
        </MemoryRouter>,
      );
      expect(
        screen.getByText('No anniversary data available for this period.'),
      ).toBeInTheDocument();
    },
  );
});
