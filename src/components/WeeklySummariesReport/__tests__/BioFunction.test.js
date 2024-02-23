import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BioFunction from '../BioFunction';




describe('BioFunction component', () => {
  it('should render correctly with bioCanEdit true', () => {
    const mockHandleProfileChange = jest.fn();
    const textColors = {
      Default: 'black',
      // Add other text colors as needed for your test case
    };

    const { getByText, getByLabelText } = render(
      <BioFunction
        bioPosted="default"
        totalTangibleHrs={100}
        daysInTeam={70}
        textColors={textColors}
        summary={{ weeklySummaryOption: 'option1' }}
        bioCanEdit={true}
        handleProfileChange={mockHandleProfileChange}
        userId="123"
      />
    );

    expect(getByText('Bio announcement:')).toBeInTheDocument();

    // Simulate toggle switch interaction
    const toggleSwitch = getByLabelText('Toggle bio switch');
    fireEvent.click(toggleSwitch);

    expect(mockHandleProfileChange).toHaveBeenCalledWith('123', true, 'bio');
  });

  it('should render correctly with bioCanEdit false', () => {
    const { getByText } = render(
      <BioFunction
        bioPosted="posted"
        textColors={{ Default: 'black' }}
        bioCanEdit={false}
      />
    );

    expect(getByText('Bio announcement:')).toBeInTheDocument();
    expect(getByText('Posted')).toBeInTheDocument();
  });
});
