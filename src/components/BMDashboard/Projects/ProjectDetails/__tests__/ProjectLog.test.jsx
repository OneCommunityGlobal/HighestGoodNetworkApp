import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectLog from '../ProjectLog';
import { EMPTY_FILTERS, filterMembers, getMemberOptions, highlightParts } from '../memberSearch';

const members = [
  {
    id: '1',
    firstName: 'Cailin',
    lastName: 'Colby',
    role: 'Carpenter',
    team: 'Team A',
    currentTask: 'Framing',
    totalHrs: 120,
    todaysHrs: 0,
  },
  {
    id: '2',
    firstName: 'Carl',
    lastName: 'Smith',
    role: 'Volunteer',
    team: 'Team B',
    currentTask: 'Painting',
    totalHrs: 30,
    todaysHrs: 2.5,
  },
  {
    id: '3',
    firstName: 'Casey',
    lastName: 'Colby',
    role: 'Carpenter',
    team: 'Team B',
    currentTask: 'Framing',
    totalHrs: 10,
    todaysHrs: 1,
  },
];
const change = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const advance = (ms = 350) => act(() => vi.advanceTimersByTime(ms));
const table = () => screen.getByRole('table');
const rowNames = () =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .map(row => row.textContent);

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
});

describe('on-site member filtering', () => {
  it('preserves all existing columns and starts with clear disabled', () => {
    render(<ProjectLog members={members} />);
    expect(within(table()).getAllByRole('columnheader')).toHaveLength(8);
    expect(rowNames()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeDisabled();
  });

  it('applies case-insensitive partial matching only after 350ms', () => {
    render(<ProjectLog members={members} />);
    change('First Name', 'AIL');
    advance(349);
    expect(rowNames()).toHaveLength(3);
    advance(1);
    expect(rowNames()).toHaveLength(1);
    expect(rowNames()[0]).toContain('Cailin');
    expect(within(table()).getByText('ail', { selector: 'mark' })).toBeInTheDocument();
  });

  it('restarts the delay for each keystroke and never applies an older query', () => {
    render(<ProjectLog members={members} />);
    change('First Name', 'Cail');
    advance(300);
    change('First Name', 'Carl');
    advance(50);
    expect(rowNames()).toHaveLength(3);
    advance(300);
    expect(rowNames()).toHaveLength(1);
    expect(rowNames()[0]).toContain('Carl');
  });

  it('combines columns with AND and trims surrounding whitespace', () => {
    render(<ProjectLog members={members} />);
    change('Role', ' carpenter ');
    change('Team', 'team b');
    advance();
    expect(rowNames()).toHaveLength(1);
    expect(rowNames()[0]).toContain('Casey');
  });

  it('clears every field immediately and cancels pending work', () => {
    render(<ProjectLog members={members} />);
    change('Role', 'Carpenter');
    advance();
    change('First Name', 'Nobody');
    fireEvent.click(screen.getByRole('button', { name: 'Clear All Filters' }));
    expect(rowNames()).toHaveLength(3);
    expect(screen.getByLabelText('Role')).toHaveValue('');
    expect(screen.getByLabelText('First Name')).toHaveValue('');
    advance(700);
    expect(rowNames()).toHaveLength(3);
    expect(within(table()).queryByText('Carpenter', { selector: 'mark' })).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('supports task and numeric columns, including zero', () => {
    render(<ProjectLog members={members} />);
    change('Current Task', 'fram');
    change("Today's Hrs", '0');
    advance();
    expect(rowNames()).toHaveLength(1);
    expect(rowNames()[0]).toContain('Cailin');
    expect(within(table()).getByText('0', { selector: 'mark' })).toBeInTheDocument();
  });

  it('shows no-match and empty-data states without throwing', () => {
    const { rerender } = render(<ProjectLog members={members} />);
    change('ID', 'unknown');
    advance();
    expect(within(table()).getByText('No members match these filters.')).toBeInTheDocument();
    rerender(<ProjectLog members={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 0 of 0 members');
  });

  it('recomputes filtered rows and suggestions when members are refreshed', () => {
    const { rerender } = render(<ProjectLog members={members} />);
    change('First Name', 'Cam');
    advance();
    rerender(
      <ProjectLog members={[...members, { ...members[0], id: '4', firstName: 'Cameron' }]} />,
    );
    expect(rowNames()).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Cameron' })).toBeInTheDocument();
  });

  it('cancels the debounce on unmount', () => {
    const { unmount } = render(<ProjectLog members={members} />);
    change('First Name', 'Ca');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses the existing sample rows when no member source is supplied', () => {
    render(<ProjectLog />);
    expect(rowNames()).toHaveLength(3);
    expect(within(table()).getByText('Dora')).toBeInTheDocument();
  });
});

describe('typeahead', () => {
  it.each(['First Name', 'Last Name', 'Role', 'Team'])(
    'provides a labelled combobox for %s',
    label => {
      render(<ProjectLog members={members} />);
      expect(screen.getByRole('combobox', { name: label })).toHaveAttribute(
        'aria-autocomplete',
        'list',
      );
    },
  );

  it('offers unique values from the matching column and selects by mouse', () => {
    render(<ProjectLog members={members} />);
    change('Role', 'car');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Carpenter' }));
    fireEvent.click(screen.getByRole('option', { name: 'Carpenter' }));
    expect(screen.getByLabelText('Role')).toHaveValue('Carpenter');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(rowNames()).toHaveLength(2);
  });

  it('supports arrow keys and Enter while retaining input focus semantics', () => {
    render(<ProjectLog members={members} />);
    const input = screen.getByLabelText('First Name');
    fireEvent.focus(input);
    change('First Name', 'ca');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const selected = screen
      .getAllByRole('option')
      .find(option => option.getAttribute('aria-selected') === 'true');
    expect(input).toHaveAttribute('aria-activedescendant', selected.id);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('Casey');
    expect(rowNames()).toHaveLength(1);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('Escape and blur dismiss suggestions without changing the query', () => {
    render(<ProjectLog members={members} />);
    const input = screen.getByLabelText('First Name');
    change('First Name', 'ca');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input).toHaveValue('ca');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input).toHaveValue('ca');
  });

  it('does not accept suggestions while composing text', () => {
    render(<ProjectLog members={members} />);
    const input = screen.getByLabelText('First Name');
    change('First Name', 'ca');
    fireEvent.keyDown(input, { key: 'ArrowDown', isComposing: true });
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('limits the dropdown to eight suggestions', () => {
    render(
      <ProjectLog
        members={Array.from({ length: 25 }, (_, i) => ({
          ...members[0],
          id: `${i}`,
          firstName: `Name ${i}`,
        }))}
      />,
    );
    change('First Name', 'Name');
    expect(screen.getAllByRole('option')).toHaveLength(8);
  });
});

describe('safe search values', () => {
  it('treats punctuation and markup as literal text, never executable HTML', () => {
    const name = '[Ann].*<img src=x>';
    render(<ProjectLog members={[{ ...members[0], firstName: name }]} />);
    change('First Name', '[ann].*');
    advance();
    expect(rowNames()).toHaveLength(1);
    expect(within(table()).getByText('[Ann].*', { selector: 'mark' })).toBeInTheDocument();
    expect(within(table()).queryByRole('img', { hidden: true })).toBeNull();
  });

  it('handles absent data and deduplicates names without changing source records', () => {
    const data = [{ firstName: null }, { firstName: ' Cailin ' }, { firstName: 'cailin' }];
    expect(getMemberOptions(data, 'firstName')).toEqual(['Cailin']);
    expect(filterMembers(data, { ...EMPTY_FILTERS, firstName: 'CAI' })).toHaveLength(2);
    expect(data[1].firstName).toBe(' Cailin ');
  });

  it('highlights all literal matches and preserves original case', () => {
    expect(
      highlightParts('Anna ANNA', 'ann')
        .filter(part => part.match)
        .map(part => part.text),
    ).toEqual(['Ann', 'ANN']);
    expect(highlightParts(null, '')).toEqual([{ text: '', match: false, key: 0 }]);
  });
});
