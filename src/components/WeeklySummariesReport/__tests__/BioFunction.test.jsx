import { render, screen } from '@testing-library/react';
import BioFunction from '../BioFunction';

const mockHandleProfileChange = vi.fn();
const colors = {
  Default: 'black',
};

const baseProps = {
  bioPosted: 'default',
  totalTangibleHrs: 100,
  daysInTeam: 70,
  textColors: colors,
  summary: { weeklySummaryOption: 'option1' },
  bioCanEdit: true,
  handleProfileChange: mockHandleProfileChange,
  userId: 123,
};

describe('BioFunction component', () => {
  it('renders bio heading', () => {
    render(<BioFunction {...baseProps} />);
    expect(screen.getByText('Bio announcement:')).toBeInTheDocument();
  });

  it('renders editable bio elements when bioCanEdit is true', () => {
    render(<BioFunction {...baseProps} />);
    expect(screen.getByText('Bio announcement:')).toBeInTheDocument();

    const bioAnnouncementDiv = screen.getByTestId('bio-announcement'); // Add data-testid in component
    // eslint-disable-next-line testing-library/no-node-access
    expect(bioAnnouncementDiv.children.length).toBe(2);
  });

  it('renders correctly when bioCanEdit is false', () => {
    render(<BioFunction {...baseProps} bioCanEdit={false} />);
    expect(screen.getByText('Bio announcement:')).toBeInTheDocument();

    const toggleDivs = screen.queryAllByTestId('bio-toggle'); // Add test ID to those elements
    expect(toggleDivs.length).toBe(0);
  });

  it('renders "Not requested/posted" when bioPosted is default and bioCanEdit is false', () => {
    render(<BioFunction {...baseProps} bioCanEdit={false} bioPosted="default" />);
    expect(screen.getByText('Bio announcement:')).toBeInTheDocument();
    expect(screen.getByText('Not requested/posted')).toBeInTheDocument();
  });

  it('renders "Posted" when bioPosted is "posted"', () => {
    render(<BioFunction {...baseProps} bioCanEdit={false} bioPosted="posted" />);
    expect(screen.getByText('Bio announcement:')).toBeInTheDocument();
    expect(screen.getByText('Posted')).toBeInTheDocument();
  });

  it('renders "Requested" when bioPosted is empty', () => {
    render(<BioFunction {...baseProps} bioCanEdit={false} bioPosted="" />);
    expect(screen.getByText('Bio announcement:')).toBeInTheDocument();
    expect(screen.getByText('Requested')).toBeInTheDocument();
  });
});
