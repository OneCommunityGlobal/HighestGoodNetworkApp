import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { shallow } from 'enzyme';
import MockNavLink from './MockNavLink';
import TabToolTips from '../TabToolTips';

/** ****************************TESTS PRE-REQUISITE************************************ */
let clickedLinkId = null;

const handleNavLinkClick = id => {
  clickedLinkId = id;
};
const mockComponentWithNavLink = () => {
  render(
    <div>
      <MockNavLink id="nabLink-basic" onClickHandler={handleNavLinkClick}>
        Basic Information
      </MockNavLink>
      <MockNavLink id="nabLink-time" onClickHandler={handleNavLinkClick}>
        Volunteering Times
      </MockNavLink>
      <MockNavLink id="nabLink-teams" onClickHandler={handleNavLinkClick}>
        Teams
      </MockNavLink>
      <MockNavLink id="nabLink-projects" onClickHandler={handleNavLinkClick}>
        Projects
      </MockNavLink>
      <TabToolTips />
    </div>,
  );
};

// shallow rendering
const mockComponentWithoutNavLink = () => {
  return shallow(<TabToolTips />);
};

// constants
const TOOLTIP_1 = 'This is where your contact information and bio go';
const TOOLTIP_2 =
  'This shares your start and end dates, committed hours, total hours volunteered, etc.';
const TOOLTIP_3 =
  'This shows any teams you are a member of. You will see all other members of your team in the Leaderboard on the Time Log page and have access to their Profiles and Time Logs from there.';
const TOOLTIP_4 = 'This shows all the projects and tasks you are assigned to.';

/** ****************************TESTS CASES************************************ */
describe('TabToolTip Component Tests', () => {
  let mountedComponent;
  beforeEach(() => {
    mountedComponent = mockComponentWithoutNavLink();
  });

  it('Test case 1: renders without crashing', () => {
    expect(mountedComponent.find('[data-testid="tabtooltiptest"]')).toHaveLength(1);
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
          expect(tooltipProps.children).toContain(TOOLTIP_1);
          break;
        case 1:
          expect(tooltipProps.children).toContain(TOOLTIP_2);
          break;
        case 2:
          expect(tooltipProps.children).toContain(TOOLTIP_3);
          break;
        case 3:
          expect(tooltipProps.children).toContain(TOOLTIP_4);
          break;
        default:
          break;
      }
    });
  });

  it('Test case 4 : Assert that the tooltip is not initially visible or present', () => {
    mockComponentWithNavLink();
    const contactTooltip = screen.queryByText(TOOLTIP_1);
    expect(contactTooltip).toBeNull();
  });

  it('Test case 5 : Assert that the tooltip is visible or present after ', () => {
    mockComponentWithNavLink();
    const nabLinkBasic = screen.getByText('Basic Information');
    userEvent.click(nabLinkBasic); // Simulate a click using userEvent

    // After the click, check if the clicked link ID matches the expected tooltip target ID
    expect(clickedLinkId).toBe('nabLink-basic');

    // Now assert the presence of the tooltip based on its test ID or other identifying properties
    const contactTooltip = screen.getByTestId('tabtooltiptest-1');
    expect(contactTooltip).toBeInTheDocument();
  });
  it('Test case 6 : Assert that the tooltip is visible or present after ', () => {
    mockComponentWithNavLink();
    const nabLinkBasic = screen.getByText('Volunteering Times');
    userEvent.click(nabLinkBasic); // Simulate a click using userEvent

    // After the click, check if the clicked link ID matches the expected tooltip target ID
    expect(clickedLinkId).toBe('nabLink-time');

    // Now assert the presence of the tooltip based on its test ID or other identifying properties
    const contactTooltip = screen.getByTestId('tabtooltiptest-2');
    expect(contactTooltip).toBeInTheDocument();
  });
  it('Test case 7 : Assert that the tooltip is visible or present after ', () => {
    mockComponentWithNavLink();
    const nabLinkBasic = screen.getByText('Teams');
    userEvent.click(nabLinkBasic); // Simulate a click using userEvent

    // After the click, check if the clicked link ID matches the expected tooltip target ID
    expect(clickedLinkId).toBe('nabLink-teams');

    // Now assert the presence of the tooltip based on its test ID or other identifying properties
    const contactTooltip = screen.getByTestId('tabtooltiptest-3');
    expect(contactTooltip).toBeInTheDocument();
  });
  it('Test case 8 : Assert that the tooltip is visible or present after ', () => {
    mockComponentWithNavLink();
    const nabLinkBasic = screen.getByText('Projects');
    userEvent.click(nabLinkBasic); // Simulate a click using userEvent

    // After the click, check if the clicked link ID matches the expected tooltip target ID
    expect(clickedLinkId).toBe('nabLink-projects');

    // Now assert the presence of the tooltip based on its test ID or other identifying properties
    const contactTooltip = screen.getByTestId('tabtooltiptest-4');
    expect(contactTooltip).toBeInTheDocument();
  });
});
