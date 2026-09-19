import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AnniversaryCelebrated from './AnniversaryCelebrated';

describe('AnniversaryCelebrated', () => {
  it('renders without crashing when anniversary data is missing', () => {
    render(
      <MemoryRouter>
        <AnniversaryCelebrated isLoading={false} data={undefined} darkMode={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText('No anniversaries found')).toBeInTheDocument();
  });
});
