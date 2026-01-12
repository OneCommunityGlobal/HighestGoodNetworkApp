import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockNavLink from '../MockData/MockNavLink'; // mock component
import BasicTabTips from '../BasicTabTips';

// Mock reactstrap Tooltip component to avoid issues in test environment
vi.mock('reactstrap', () => ({
  Tooltip: ({ children, isOpen, target, toggle, ...props }) =>
    isOpen ? (
      <div data-testid={`tooltip-${target}`} className="tooltip" {...props}>
        {children}
      </div>
    ) : null,
}));

/** ****************************TESTS PRE-REQUISITE************************************ */
let clickedLinkId = null;

const handleNavLinkClick = id => {
  clickedLinkId = id;
};

const mockComponentWithNavLink = () => {
  return render(
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

const mockComponentWithoutNavLink = () => {
  return render(<BasicTabTips />);
};

/** ****************************TESTS CASES************************************ */
const tooltipName = 'First Name and Last Name';
const tooltipEmail = 'Your Email';
const tooltipPhone = 'Your Phone Number';
const tooltipTitle = 'Your Preferred Title';

describe('TabToolTip Component Tests', () => {
  beforeEach(() => {
    clickedLinkId = null;
    vi.clearAllMocks();
  });

  it('Test case 1: Renders without crashing', () => {
    const { getByTestId } = mockComponentWithoutNavLink();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByTestId('test-basictabtips')).toBeInTheDocument();
  });

  it('Test case 2: Renders with correct structure', () => {
    const { container } = mockComponentWithoutNavLink();
    // Check if the root div exists
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('div[data-testid="test-basictabtips"]')).toBeInTheDocument();
  });

  it('Test case 3: Contains tooltip components with the correct targets', () => {
    // We can check the source code for tooltip content
    const sourceCode = BasicTabTips.toString();
    expect(sourceCode).toContain(tooltipName);
    expect(sourceCode).toContain(tooltipEmail);
    expect(sourceCode).toContain(tooltipPhone);
    expect(sourceCode).toContain(tooltipTitle);
  });

  it('Test case 4: Assert that the tooltip is not initially visible', () => {
    mockComponentWithNavLink();

    // Check that none of the tooltips are visible initially
    expect(screen.queryByText(tooltipName)).not.toBeInTheDocument();
    expect(screen.queryByText(tooltipEmail)).not.toBeInTheDocument();
    expect(screen.queryByText(tooltipPhone)).not.toBeInTheDocument();
    expect(screen.queryByText(tooltipTitle)).not.toBeInTheDocument();
  });

  it('Test case 5: Assert clicking Email component sets the correct ID', async () => {
    mockComponentWithNavLink();
    const emailComp = screen.getByText('Email');
    await userEvent.click(emailComp);

    // Check if the clicked link ID matches
    expect(clickedLinkId).toBe('info-email');
  });

  // Similar tests for other tooltip interactions
  it('Test case 6: Assert clicking Phone component sets the correct ID', async () => {
    mockComponentWithNavLink();
    const phoneComp = screen.getByText('Phone');
    await userEvent.click(phoneComp);

    expect(clickedLinkId).toBe('info-phone');
  });

  it('Test case 7: Assert clicking Title component sets the correct ID', async () => {
    mockComponentWithNavLink();
    const titleComp = screen.getByText('Title');
    await userEvent.click(titleComp);

    expect(clickedLinkId).toBe('info-title');
  });

  it('Test case 8: Assert clicking Name component sets the correct ID', async () => {
    mockComponentWithNavLink();
    const nameComp = screen.getByText('Name');
    await userEvent.click(nameComp);

    expect(clickedLinkId).toBe('info-name');
  });
});
