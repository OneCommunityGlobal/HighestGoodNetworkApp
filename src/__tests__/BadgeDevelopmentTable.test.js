import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BadgeDevelopmentTable from 'components/Badge/BadgeDevelopmentTable';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';

const mockStore = configureStore([thunk]);

// mock data used for testing purpose. You can add your own data to test the component.

const mockData = {
  alertVisible: false,
  allBadgeData: [
    {
      _id: 'abc1',
      badgeName: '30 HOURS 3-WEEK STREAK',
      category: 'Stewardship',
      imageUrl: 'https://www.test.com/30-HOURS-STREAK-3-WEEKS-200-PX.png',
      ranking: 118,
      description:
        'Contributing 30 hours for one week is impressive. Doing it for 3 weeks in a row is absolutely amazing! Well done!',
      months: null,
      multiple: null,
      people: null,
      totalHrs: 30,
      type: 'X Hours for X Week Streak',
      weeks: 3,
      showReport: true,
    },
    {
      _id: 'abc2',
      badgeName: 'LEAD A TEAM OF 40+ (Trailblazer)',
      category: 'Stewardship',
      imageUrl: 'https://www.test.com/LEADER-OF-40-PLUS-TEAM-TRAILBLAZER-200-PX.png',
      ranking: 53,
      description:
        'You are a leader! More specifically, you’ve led a team of 40 people or more as a member of One Community. Fantastic work!',
      months: null,
      multiple: null,
      people: 40,
      totalHrs: null,
      type: 'Lead a team of X+',
      weeks: null,
    },
  ],
  color: null,
  message: '',
};

const renderComponent = mockProps => {
  const store = mockStore({
    badge: {
      alertVisible: mockProps.alertVisible,
      allBadgeData: mockProps.allBadgeData,
      color: mockProps.color,
      message: mockProps.message,
    },
    allProjects: {
      projects: [],
    },
  });

  return render(
    <Provider store={store}>
      <BadgeDevelopmentTable allBadgeData={mockProps.allBadgeData} />
    </Provider>,
  );
};

describe('BadgeDevelopmentTable component', () => {
  it('render without crashing', () => {
    renderComponent(mockData);
  });
  it('check if the column names are displaying properly', () => {
    renderComponent(mockData);
    const badgeElement = screen.getByText('Badge');
    const nameElement = screen.getByText('Name');
    const descriptionElement = screen.getByText('Description');
    const typeElement = screen.getByText('Type');
    const detailsElement = screen.getByText('Details');
    const rankingElement = screen.getByText('Ranking');
    const actionElement = screen.getByText('Action');
    const reportElement = screen.getByText('Reports Page Notification');

    expect(badgeElement.textContent).toBe('Badge');
    expect(nameElement.textContent).toBe('Name');
    expect(descriptionElement.textContent).toBe('Description');
    expect(typeElement.textContent).toBe('Type');
    expect(detailsElement.textContent).toBe('Details');
    expect(rankingElement.textContent).toBe('Ranking ');
    expect(actionElement.textContent).toBe('Action');
    expect(reportElement.textContent).toBe('Reports Page Notification');
  });
  it('tooltip associated with ranking works properly', async () => {
    const { container } = renderComponent(mockData);
    const iconElement = container.querySelector('.fa.fa-info-circle');

    fireEvent.mouseEnter(iconElement);

    await waitFor(() => {
      const updatedText = screen.getByRole('tooltip');
      expect(updatedText.textContent).toContain(
        'Sort the number by ascending or descending order. The lower the number (other than zero) the higher the badge ranking.',
      );
      expect(updatedText.textContent).toContain(
        'Note that 0 is treated as the largest number (thus the lowest ranking). When no number is specified for the ranking field, the default value is 0.',
      );
      expect(updatedText.textContent).toContain(
        'All badges of the same number in ranking sort alphabetically by their names.',
      );
    });

    fireEvent.mouseLeave(iconElement);
    await waitFor(() => {
      const updatedText = screen.queryByRole('tooltip');
      expect(updatedText).toBeNull();
    });
  });
  it('check if the right images are printing beside each badge row', () => {
    const { container } = renderComponent(mockData);
    mockData.allBadgeData.forEach((item, index) => {
      const imageElement = container.querySelector(`#popover_${item._id}`);
      expect(imageElement.src).toBe(item.imageUrl);
    });
  });
  it('check badge name, description, type, details, ranking', () => {
    const modifiedProps = { ...mockData };
    modifiedProps.allBadgeData[0] = {
      ...modifiedProps.allBadgeData[0],
      totalHrs: 5,
      weeks: 4,
    };
    modifiedProps.allBadgeData[1] = { ...modifiedProps.allBadgeData[1], people: null };
    renderComponent(modifiedProps);
    const mockDetails = [
      `${modifiedProps.allBadgeData[0].totalHrs} Hours ${modifiedProps.allBadgeData[0].weeks}-Week Streak`,
      `Lead A Team Of ${modifiedProps.allBadgeData[1].people}+`,
    ];

    modifiedProps.allBadgeData.forEach((item, index) => {
      expect(screen.getByText(item.badgeName)).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
      expect(screen.getByText(item.type, { selector: 'td' })).toBeInTheDocument();
      if (
        (modifiedProps.allBadgeData[index].totalHrs && modifiedProps.allBadgeData[index].weeks) ||
        modifiedProps.allBadgeData[index].people
      ) {
        expect(screen.getByText(mockDetails[index])).toBeInTheDocument();
      } else {
        const detailsElement = screen.queryByText(mockDetails[index]);
        expect(detailsElement).toBeNull();
      }
      expect(screen.getByText(item.ranking)).toBeInTheDocument();
    });
  });
  it('check action: edit button', () => {
    const { container } = renderComponent(mockData);
    mockData.allBadgeData.forEach(item => {
      const editElement = container.querySelector('.btn.btn-outline-info');
      fireEvent.click(editElement);
      expect(screen.getByText('Update')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });
  it('check action: delete button', () => {
    const { container } = renderComponent(mockData);
    mockData.allBadgeData.forEach(item => {
      const deleteElement = container.querySelector('.btn.btn-outline-danger');
      fireEvent.click(deleteElement);
      expect(screen.getByText('Confirm Delete Badge')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(
        screen.getByText(
          "Hold up there Sparky, are you sure you want to delete this badge? Some things in life can be undone, deleting this badge isn't one of them.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Consider your next move carefully. If you click "delete", the badge above will be wiped from existence and removed from all who have earned it.',
        ),
      ).toBeInTheDocument();
    });
  });
  it('check reports page notification checkmark', () => {
    const { container } = renderComponent(mockData);
    const checkElement = container.querySelector('#abc1');
    fireEvent.click(checkElement);
    mockData.allBadgeData.forEach(async (item, index) => {
      const checkbox = container.querySelector(`#${item._id}`);
      if (index == 0) {
        expect(checkbox.checked).toBe(true);
      } else {
        expect(checkbox.checked).toBe(false);
      }
    });
  });
});
