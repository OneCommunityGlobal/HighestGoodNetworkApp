import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import LinkListInput from '../LinkListInput';

const PR_ONE = 'https://github.com/OneCommunityGlobal/HighestGoodNetworkApp/pull/5675';
const PR_TWO = 'https://github.com/OneCommunityGlobal/HGNRest/pull/2414';

// eslint-disable-next-line react/prop-types
function Harness({ initial = [''], errors, maxLinks }) {
  const [links, setLinks] = useState(initial);
  return (
    <LinkListInput
      id="test-links"
      links={links}
      errors={errors}
      onChange={setLinks}
      maxLinks={maxLinks}
    />
  );
}

describe('LinkListInput', () => {
  it('starts with one labelled row and no remove button', () => {
    render(<Harness />);
    expect(screen.getByLabelText('Link 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remove link/ })).not.toBeInTheDocument();
    expect(screen.getByText(/GitHub pull request, Google Doc/)).toBeInTheDocument();
  });

  it('adds a row and moves focus to it', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add another link' }));
    await waitFor(() => expect(screen.getByLabelText('Link 2')).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Remove link 1' })).toBeInTheDocument();
  });

  it('removes a row and keeps the others', async () => {
    render(<Harness initial={[PR_ONE, PR_TWO]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove link 1' }));
    expect(screen.queryByLabelText('Link 2')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Link 1')).toHaveValue(PR_TWO);
  });

  it('splits several pasted links into one row each', () => {
    render(<Harness />);
    fireEvent.paste(screen.getByLabelText('Link 1'), {
      clipboardData: { getData: () => `${PR_ONE};${PR_TWO}` },
    });
    expect(screen.getByLabelText('Link 1')).toHaveValue(PR_ONE);
    expect(screen.getByLabelText('Link 2')).toHaveValue(PR_TWO);
  });

  it('lets a single pasted link behave as a normal paste', () => {
    render(<Harness />);
    const notPrevented = fireEvent.paste(screen.getByLabelText('Link 1'), {
      clipboardData: { getData: () => PR_ONE },
    });
    expect(notPrevented).toBe(true);
  });

  it('stops at the limit and says so', async () => {
    render(<Harness initial={[PR_ONE, PR_TWO]} maxLinks={2} />);
    expect(screen.getByRole('button', { name: 'Add another link' })).toBeDisabled();
    expect(screen.getByText('Up to 2 links.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove link 2' }));
    expect(screen.getByRole('button', { name: 'Add another link' })).toBeEnabled();
  });

  it('shows each error next to its row and ties it to the input', () => {
    render(<Harness initial={[PR_ONE, 'nope']} errors={['', 'Enter a full link.']} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Enter a full link.');
    expect(screen.getByLabelText('Link 2')).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(alert.id),
    );
    expect(screen.getByLabelText('Link 2')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Link 1')).not.toHaveAttribute('aria-invalid', 'true');
  });
});
