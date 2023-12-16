import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { shallow } from 'enzyme';
import MockNavLink from './MockNavLink';

import TabToolTips from '../TabToolTips'; // Adjust the import path as needed

// render component with
const mockComponentWithNavLink = () => {
  render(
    <div>
      <MockNavLink id="nabLink-basic">Basic Information</MockNavLink>
      <MockNavLink id="nabLink-time">Volunteering Times</MockNavLink>
      <MockNavLink id="nabLink-teams">Teams</MockNavLink>
      <MockNavLink id="nabLink-projects">Projects</MockNavLink>
      <TabToolTips />
    </div>,
  );
};

const mockComponentWithoutNavLink = () => {
  return shallow(<TabToolTips />);
};
describe('TabToolTip Component Tests', () => {
  let mountedComponent;
  beforeEach(() => {
    mountedComponent = mockComponentWithoutNavLink();
  });

  it('Test case 1: renders without crashing', () => {
    expect(mountedComponent.find('[data-testid="tabtooltiptest"]')).toHaveLength(2);
  });

  it('Test case 2 : renders with  4 tool tips wrapped within a div', () => {
    const tooltipcount = mountedComponent.find('Tooltip');
    expect(tooltipcount.length).toBe(4);

    const divCount = mountedComponent.find('div');
    expect(divCount.length).toBe(1);
  });
  it('Test case 3 : displays correct content in tooltips', () => {
    const tooltips = mountedComponent.find('Tooltip');

    tooltips.forEach((tooltip, index) => {
      const tooltipProps = tooltip.props();
      switch (index) {
        case 0:
          expect(tooltipProps.children).toContain(
            'This is where your contact information and bio go',
          );
          break;
        case 1:
          expect(tooltipProps.children).toContain(
            'This shares your start and end dates, committed hours, total hours volunteered, etc.',
          );
          break;
        case 2:
          expect(tooltipProps.children).toContain(
            'This shows any teams you are a member of. You will see all other members of your team in the Leaderboard on the Time Log page and have access to their Profiles and Time Logs from there.',
          );
          break;
        case 3:
          expect(tooltipProps.children).toContain(
            'This shows all the projects and tasks you are assigned to.',
          );
          break;
        default:
          break;
      }
    });
  });

  it(' Test case 4 : Assert that the tooltip is not initially visible or present', () => {
    mockComponentWithNavLink();
    const contactTooltip = screen.queryByText('This is where your contact information and bio go');
    expect(contactTooltip).toBeNull();
  });

  it(' Test case 5 : Assert that the tooltip is not initially visible or present', () => {
    mockComponentWithNavLink();
    const nabLinkBasic = screen.getByText('Basic Information'); // Find the MockNavLink text content
    fireEvent.mouseEnter(nabLinkBasic); // Simulate mouse enter event on nabLink-basic

    // Assert the presence of the tooltip or its content
    const contactTooltip = screen.getByTestId('tabtooltiptest'); // Find the tooltip by test ID
    expect(contactTooltip).toBeInTheDocument();
  });
});
