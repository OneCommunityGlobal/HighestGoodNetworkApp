import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WeeklySummaryOptions from '../WeeklySummaryOptions';

describe('WeeklySummaryOptions Component', () => {
  const summaryOptions = [
    'Required',
    'Not Required (Slate Gray)',
    'Team Fabulous (Fuschia)',
    'Team Marigold (Orange)',
    'Team Luminous (Yellow)',
    'Team Lush (Green)',
    'Team Skye (Blue)',
    'Team Azure (Indigo)',
    'Team Amethyst (Purple)',
  ];

  test('test_render_summary_options', () => {
    render(<WeeklySummaryOptions handleUserProfile={() => {}} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(summaryOptions.length);
    options.forEach((option, index) => {
      expect(option).toHaveTextContent(summaryOptions[index]);
    });
  });

  test('test_handle_user_profile_called_on_change', () => {
    const handleUserProfile = jest.fn();
    render(<WeeklySummaryOptions handleUserProfile={handleUserProfile} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Team Fabulous' } });
    expect(handleUserProfile).toHaveBeenCalled();
  });

  test('test_default_value_set_to_required', () => {
    render(<WeeklySummaryOptions handleUserProfile={() => {}} />);
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('Required');
  });
});