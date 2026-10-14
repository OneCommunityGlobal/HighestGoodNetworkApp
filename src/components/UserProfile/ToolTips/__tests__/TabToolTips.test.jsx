import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockNavLink from '../MockData/MockNavLink';
import TabToolTips from '../TabToolTips';

// Tooltip texts
const TOOLTIP_1 = 'This is where your contact information and bio go';
const TOOLTIP_2 =
  'This shares your start and end dates, committed hours, total hours volunteered, etc.';
const TOOLTIP_3 =
  'This shows any teams you are a member of. You will see all other members of your team in the Leaderboard on the Time Log page and have access to their Profiles and Time Logs from there.';
const TOOLTIP_4 = 'This shows all the projects and tasks you are assigned to.';

let clickedLinkId = null;

const setup = () => {
  clickedLinkId = null;
  render(
    <div>
      <MockNavLink
        id="nabLink-basic"
        onClickHandler={id => {
          clickedLinkId = id;
        }}
      >
        Basic Information
      </MockNavLink>
      <MockNavLink
        id="nabLink-time"
        onClickHandler={id => {
          clickedLinkId = id;
        }}
      >
        Volunteering Times
      </MockNavLink>
      <MockNavLink
        id="nabLink-teams"
        onClickHandler={id => {
          clickedLinkId = id;
        }}
      >
        Teams
      </MockNavLink>
      <MockNavLink
        id="nabLink-projects"
        onClickHandler={id => {
          clickedLinkId = id;
        }}
      >
        Projects
      </MockNavLink>
      <TabToolTips />
    </div>,
  );
};

describe('TabToolTips Component', () => {
  test('renders without crashing and all tooltips are present but hidden', () => {
    setup();

    expect(screen.getByTestId('tabtooltiptest')).toBeInTheDocument();

    // Tooltips should not be visible initially
    expect(screen.queryByText(TOOLTIP_1)).not.toBeInTheDocument();
    expect(screen.queryByText(TOOLTIP_2)).not.toBeInTheDocument();
    expect(screen.queryByText(TOOLTIP_3)).not.toBeInTheDocument();
    expect(screen.queryByText(TOOLTIP_4)).not.toBeInTheDocument();
  });

  test('shows Basic Info tooltip when clicked', async () => {
    setup();
    await userEvent.click(screen.getByText('Basic Information'));
    expect(clickedLinkId).toBe('nabLink-basic');
    expect(screen.getByTestId('tabtooltiptest-1')).toBeInTheDocument();
  });

  test('shows Volunteering Times tooltip when clicked', async () => {
    setup();
    await userEvent.click(screen.getByText('Volunteering Times'));
    expect(clickedLinkId).toBe('nabLink-time');
    expect(screen.getByTestId('tabtooltiptest-2')).toBeInTheDocument();
  });

  test('shows Teams tooltip when clicked', async () => {
    setup();
    await userEvent.click(screen.getByText('Teams'));
    expect(clickedLinkId).toBe('nabLink-teams');
    expect(screen.getByTestId('tabtooltiptest-3')).toBeInTheDocument();
  });

  test('shows Projects tooltip when clicked', async () => {
    setup();
    await userEvent.click(screen.getByText('Projects'));
    expect(clickedLinkId).toBe('nabLink-projects');
    expect(screen.getByTestId('tabtooltiptest-4')).toBeInTheDocument();
  });
});
