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
  test('test_correct_value_attributes', () => {
    render(<WeeklySummaryOptions handleUserProfile={() => {}} />);
    const options = screen.getAllByRole('option');
    const optionValues = [
      'Required',
      'Not Required',
      'Team Fabulous',
      'Team Marigold',
      'Team Luminous',
      'Team Lush',
      'Team Skye',
      'Team Azure',
      'Team Amethyst',
    ];
    options.forEach((option, index) => {
      expect(option).toHaveAttribute('value', optionValues[index]);
    });
  });
  
  test('test_value_changes_when_different_option_selected', () => {
    const handleUserProfile = jest.fn();
    render(<WeeklySummaryOptions handleUserProfile={handleUserProfile} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Team Marigold' } });
    expect(select.value).toBe('Team Marigold');
  });
  
  test('test_render_without_default_value', () => {
    const { container } = render(
      <WeeklySummaryOptions handleUserProfile={() => {}} />
    );
    const select = screen.getByRole('combobox');
    // If there's no default value, it should have the first option selected
    expect(select.value).toBe('Required');
  });
  
  test('test_accessibility_attributes', () => {
    render(<WeeklySummaryOptions handleUserProfile={() => {}} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'weeklySummaryOption');
    expect(select).toHaveAttribute('name', 'weeklySummaryOption');
    // Add more checks if there are additional accessibility attributes
  });
  
});