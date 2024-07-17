import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { shallow } from 'enzyme';
import MockNavLink from '../MockData/MockNavLink'; // mock component
import BasicTabTips from '../BasicTabTips';

/** ****************************TESTS PRE-REQUISITE************************************ */
let clickedLinkId = null;

const handleNavLinkClick = id => {
  clickedLinkId = id;
};
const mockComponentWithNavLink = () => {
  render(
    <div>
      <MockNavLink id="info-email" onClickHandler={handleNavLinkClick}>
        Email
      </MockNavLink>
      <MockNavLink id="info-phone" onClickHandler={handleNavLinkClick}>
        Phone
      </MockNavLink>
      <MockNavLink id="info-title" onClickHandler={handleNavLinkClick}>
        Title
      </MockNavLink>
      <MockNavLink id="info-name" onClickHandler={handleNavLinkClick}>
        Name
      </MockNavLink>
      <BasicTabTips />
    </div>,
  );
};

// shallow rendering
const mockComponentWithoutNavLink = () => {
  return shallow(<BasicTabTips />);
};

/** ****************************TESTS CASES************************************ */
const tooltipName = 'First Name and Last Name';
const tooltipEmail = 'Your Email';
const tooltipPhone = 'Your Phone Number';
const tooltipTitle = 'Your Preferred Title';

describe('TabToolTip Component Tests', () => {
  let mountedComponent;
  beforeEach(() => {
    mountedComponent = mockComponentWithoutNavLink();
  });

  it('Test case 1: Renders without crashing', () => {
    expect(mountedComponent.find('[data-testid="test-basictabtips"]')).toHaveLength(1);
  });

  it('Test case 2 : Renders with  4 tool tips wrapped within a div', () => {
    const tooltipcount = mountedComponent.find('Tooltip');
    expect(tooltipcount.length).toBe(4);

    const divCount = mountedComponent.find('div');
    expect(divCount.length).toBe(1);
  });
  it('Test case 3 : Displays expected text in tooltips', () => {
    const tooltips = mountedComponent.find('Tooltip');

    tooltips.forEach((tooltip, index) => {
      const tooltipProps = tooltip.props();
      switch (index) {
        case 0:
          expect(tooltipProps.children).toContain(tooltipName);
          break;
        case 1:
          expect(tooltipProps.children).toContain(tooltipEmail);
          break;
        case 2:
          expect(tooltipProps.children).toContain(tooltipPhone);
          break;
        case 3:
          expect(tooltipProps.children).toContain(tooltipTitle);
          break;
        default:
          break;
      }
    });
  });

  it('Test case 4 : Assert that the tooltip is not initially visible or present', () => {
    mockComponentWithNavLink();
    let contactTooltip = screen.queryByText(tooltipName);
    expect(contactTooltip).toBeNull();
    contactTooltip = screen.queryByText(tooltipEmail);
    expect(contactTooltip).toBeNull();
    contactTooltip = screen.queryByText(tooltipPhone);
    expect(contactTooltip).toBeNull();
    contactTooltip = screen.queryByText(tooltipTitle);
    expect(contactTooltip).toBeNull();
  });
  it('Test case 5 : Assert only the tooltip for Email  is visible after clicking the Email component ', () => {
    mockComponentWithNavLink();
    const emailComp = screen.getByText('Email');
    userEvent.click(emailComp); // Simulate a click using userEvent

    // After the click, check if the clicked link ID matches the expected tooltip target ID
    expect(clickedLinkId).toBe('info-email');

    // Now assert the presence of the expected tool tip and other tool tip shouldnt be visible
    expect(screen.queryByText(tooltipEmail)).toBeInTheDocument();
    expect(screen.queryByText(tooltipName)).toBeNull();
    expect(screen.queryByText(tooltipTitle)).toBeNull();
    expect(screen.queryByText(tooltipPhone)).toBeNull();
  });
  it('Test case 6 : Assert only the tooltip for phone  is visible after clicking the phone component ', () => {
    mockComponentWithNavLink();
    const phoneComp = screen.getByText('Phone');
    userEvent.click(phoneComp); // Simulate a click using userEvent

    // After the click, check if the clicked link ID matches the expected tooltip target ID
    expect(clickedLinkId).toBe('info-phone');

    // Now assert the presence of the expected tool tip and other tool tip shouldnt be visible
    expect(screen.queryByText(tooltipPhone)).toBeInTheDocument();
    expect(screen.queryByText(tooltipName)).toBeNull();
    expect(screen.queryByText(tooltipTitle)).toBeNull();
    expect(screen.queryByText(tooltipEmail)).toBeNull();
  });
  it('Test case 7 : Assert only the tooltip for title  is visible after clicking the title component ', () => {
    mockComponentWithNavLink();
    const titleComp = screen.getByText('Title');
    userEvent.click(titleComp); // Simulate a click using userEvent

    // After the click, check if the clicked link ID matches the expected tooltip target ID
    expect(clickedLinkId).toBe('info-title');

    // Now assert the presence of the expected tool tip and other tool tip shouldnt be visible
    expect(screen.queryByText(tooltipTitle)).toBeInTheDocument();
    expect(screen.queryByText(tooltipName)).toBeNull();
    expect(screen.queryByText(tooltipEmail)).toBeNull();
    expect(screen.queryByText(tooltipPhone)).toBeNull();
  });
  it('Test case 8 : Assert only the tooltip for Name  is visible after clicking the Name component ', () => {
    mockComponentWithNavLink();
    const nameComp = screen.getByText('Name');
    userEvent.click(nameComp); // Simulate a click using userEvent

    // After the click, check if the clicked link ID matches the expected tooltip target ID
    expect(clickedLinkId).toBe('info-name');

    // Now assert the presence of the expected tool tip and other tool tip shouldnt be visible
    expect(screen.queryByText(tooltipName)).toBeInTheDocument();
    expect(screen.queryByText(tooltipEmail)).toBeNull();
    expect(screen.queryByText(tooltipTitle)).toBeNull();
    expect(screen.queryByText(tooltipPhone)).toBeNull();
  });
});
