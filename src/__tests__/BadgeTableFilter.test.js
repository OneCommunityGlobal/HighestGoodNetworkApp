import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BadgeTableFilter from 'components/Badge/BadgeTableFilter';

const resetFilters = jest.fn();
const onBadgeNameSearch = jest.fn();
const onBadgeDescriptionSearch = jest.fn();
const onBadgeTypeSearch = jest.fn();
const onBadgeRankingSort = jest.fn();

const renderComponent = mockData => {
  return render(
    <table>
      <tbody>
        <BadgeTableFilter
          onBadgeNameSearch={onBadgeNameSearch}
          onBadgeDescriptionSearch={onBadgeDescriptionSearch}
          onBadgeTypeSearch={onBadgeTypeSearch}
          onBadgeRankingSort={onBadgeRankingSort}
          resetFilters={resetFilters}
          name={mockData.name}
          description={mockData.description}
          type={mockData.type}
          order={mockData.order}
        />
      </tbody>
    </table>,
  );
};

describe('BadgeTableFilter component', () => {
  it('renders without crashing', () => {
    const mockData = {
      name: '',
      description: '',
      type: '',
      order: '',
    };
    renderComponent(mockData);
  });
  it('check name box', () => {
    const mockData = {
      name: 'badge',
      description: '',
      type: '',
      order: '',
    };
    const { container } = renderComponent(mockData);
    const nameElement = container.querySelector('#search_badge_name_search');
    expect(nameElement.value).toBe('badge');
  });
  it('Check description box', () => {
    const mockData = {
      name: '',
      description: 'personal record',
      type: '',
      order: '',
    };
    const { container } = renderComponent(mockData);
    const descriptionElement = container.querySelector('#search_badge_description_search');
    expect(descriptionElement.value).toBe('personal record');
  });
  it('Check type dropdown', () => {
    const mockData = {
      name: '',
      description: '',
      type: 'Personal Max',
      order: '',
    };
    const { container } = renderComponent(mockData);
    const typeElement = container.querySelector('#search_badge_types_search');

    expect(typeElement.value).toBe('Personal Max');
    Array.from(typeElement.options).forEach(option => {
      if (option.value == 'Personal Max') {
        expect(option.selected).toBe(true);
      } else {
        expect(option.selected).toBe(false);
      }
    });
  });
  it('Check ranking dropdown', () => {
    const mockData = {
      name: '',
      description: '',
      type: '',
      order: 'Descending',
    };
    const { container } = renderComponent(mockData);
    const orderElement = container.querySelector('#search_badge_ranking_sort');

    expect(orderElement.value).toBe('Descending');
    Array.from(orderElement.options).forEach(option => {
      if (option.value == 'Descending') {
        expect(option.selected).toBe(true);
      } else {
        expect(option.selected).toBe(false);
      }
    });
    expect(screen.getByText('Descending')).toBeInTheDocument();
    expect(screen.getByText('Ascending')).not.toBeInTheDocument;
  });
  it('Check if reset filter button works properly', () => {
    const mockData = {
      name: '',
      description: '',
      type: '',
      order: '',
    };
    renderComponent(mockData);
    const buttonElement = screen.getByRole('button');
    fireEvent.click(buttonElement);
    expect(resetFilters).toHaveBeenCalled();
  });
});
