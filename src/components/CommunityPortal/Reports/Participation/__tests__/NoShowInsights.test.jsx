import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import NoShowInsights from '../NoShowInsights';

const renderInsights = () => {
  const store = configureStore({ reducer: { theme: () => ({ darkMode: false }) } });
  return render(
    <Provider store={store}>
      <NoShowInsights />
    </Provider>,
  );
};

describe('NoShowInsights demographics', () => {
  it('renders Demographics as the first tab and labels its values as demonstration-only', () => {
    renderInsights();

    const tabs = screen
      .getAllByRole('button')
      .filter(button =>
        ['Demographics', 'Event type', 'Time', 'Location'].includes(button.textContent),
      );
    expect(tabs.map(tab => tab.textContent)).toEqual([
      'Demographics',
      'Event type',
      'Time',
      'Location',
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Demographics' }));

    expect(screen.getByRole('note')).toHaveTextContent('Demonstration data only');
    expect(screen.getByLabelText('Demographic category')).toHaveValue('Age');
    expect(screen.getByText('18–25')).toBeInTheDocument();
  });

  it('changes the demonstration breakdown without exposing unavailable sensitive categories', () => {
    renderInsights();
    fireEvent.click(screen.getByRole('button', { name: 'Demographics' }));

    const category = screen.getByLabelText('Demographic category');
    fireEvent.change(category, { target: { value: 'Segment' } });

    expect(screen.getByText('New participants')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Income' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Occupation' })).not.toBeInTheDocument();
  });
});
