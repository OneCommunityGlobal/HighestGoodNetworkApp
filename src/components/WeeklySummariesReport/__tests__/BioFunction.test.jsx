import { render } from '@testing-library/react';
import BioFunction from '../BioFunction';

// mock data
const mockHandleProfileChange = vi.fn();
const colors = {
  Default: 'black',
};

const props = {
  bioPosted: 'default',
  totalTangibleHrs: 100,
  daysInTeam: 70,
  textColors: colors,
  summary: { weeklySummaryOption: 'option1' },
  bioCanEdit: true,
  handleProfileChange: mockHandleProfileChange,
  userId: 123,
};

// Test Suite
describe('BioFunction component', () => {
  it('Test case 1 : Renders as expected ', () => {
    const { getByText } = render(
      <BioFunction
        bioPosted={props.bioPosted}
        totalTangibleHrs={props.totalTangibleHrs}
        daysInTeam={props.daysInTeam}
        textColors={props.textColors}
        summary={props.summary}
        bioCanEdit={props.bioCanEdit}
        handleProfileChange={props.handleProfileChange}
        userId={props.userId}
      />,
    );
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Bio announcement:')).toBeInTheDocument();
  });

  it('Test case 2 : Renders as expected when  bioCanEdit is true', () => {
    const { getByText, container } = render(
      <BioFunction
        bioPosted={props.bioPosted}
        totalTangibleHrs={props.totalTangibleHrs}
        daysInTeam={props.daysInTeam}
        textColors={props.textColors}
        summary={props.summary}
        bioCanEdit={props.bioCanEdit}
        handleProfileChange={props.handleProfileChange}
        userId={props.userId}
      />,
    );
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Bio announcement:')).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const divElements = container.querySelector('#bio-announcement');
    // eslint-disable-next-line testing-library/no-node-access
    expect(divElements.children.length).toBe(2);
  });

  it('Test case 3 : Renders as expected when  bioCanEdit is false', () => {
    props.bioCanEdit = false;
    const { getByText, container } = render(
      <BioFunction
        bioPosted={props.bioPosted}
        totalTangibleHrs={props.totalTangibleHrs}
        daysInTeam={props.daysInTeam}
        textColors={props.textColors}
        summary={props.summary}
        bioCanEdit={props.bioCanEdit}
        handleProfileChange={props.handleProfileChange}
        userId={props.userId}
      />,
    );

    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Bio announcement:')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const divElements = container.querySelectorAll('.bio-toggle');
    expect(divElements.length).toBe(0);
  });

  it('Test case 4 : Renders as expected when  bioCanEdit is false and bioPosted is default ', () => {
    props.bioCanEdit = false;
    const { getByText } = render(
      <BioFunction
        bioPosted={props.bioPosted}
        totalTangibleHrs={props.totalTangibleHrs}
        daysInTeam={props.daysInTeam}
        textColors={props.textColors}
        summary={props.summary}
        bioCanEdit={props.bioCanEdit}
        handleProfileChange={props.handleProfileChange}
        userId={props.userId}
      />,
    );

    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Bio announcement:')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Not requested/posted')).toBeInTheDocument();
  });

  it('Test case 5 : Renders as expected when  bioCanEdit is false and bioPosted is posted', () => {
    props.bioCanEdit = false;
    props.bioPosted = 'posted';
    const { getByText } = render(
      <BioFunction
        bioPosted={props.bioPosted}
        totalTangibleHrs={props.totalTangibleHrs}
        daysInTeam={props.daysInTeam}
        textColors={props.textColors}
        summary={props.summary}
        bioCanEdit={props.bioCanEdit}
        handleProfileChange={props.handleProfileChange}
        userId={props.userId}
      />,
    );
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Bio announcement:')).toBeInTheDocument();

    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Posted')).toBeInTheDocument();
  });

  it('Test case 6 : Renders as expected when  bioCanEdit is false and bioPosted is neither posted nor default', () => {
    props.bioCanEdit = false;
    props.bioPosted = '';
    const { getByText } = render(
      <BioFunction
        bioPosted={props.bioPosted}
        totalTangibleHrs={props.totalTangibleHrs}
        daysInTeam={props.daysInTeam}
        textColors={props.textColors}
        summary={props.summary}
        bioCanEdit={props.bioCanEdit}
        handleProfileChange={props.handleProfileChange}
        userId={props.userId}
      />,
    );
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Bio announcement:')).toBeInTheDocument();

    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Requested')).toBeInTheDocument();
  });
});
