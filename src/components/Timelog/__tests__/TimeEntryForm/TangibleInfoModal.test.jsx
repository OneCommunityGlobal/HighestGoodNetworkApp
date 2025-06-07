// TangibleInfoModal.test.js
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TangibleInfoModal from '../../TimeEntryForm/TangibleInfoModal'; // Adjust the path as necessary

describe('TangibleInfoModal Component', () => {
  const mockSetVisible = vi.fn();

  const baseProps = {
    visible: true,
    setVisible: mockSetVisible,
  };

  it('should render the modal when visible is true', () => {
    const { getByText } = render(
      <TangibleInfoModal 
        visible={baseProps.visible}
        setVisible={mockSetVisible}
      />
    );
    expect(getByText('Info')).toBeInTheDocument();
    expect(getByText(/Intangible time is time logged to items not related to your specific action items/i)).toBeInTheDocument();
  });

  it('should not render the modal when visible is false', () => {
    const { queryByText } = render(
    <TangibleInfoModal 
      visible={false}
      setVisible={mockSetVisible}
    />
  );
    expect(queryByText('Info')).not.toBeInTheDocument();
  });

  it('should render Close button and trigger setVisible on click', () => {
    const { getByText } = render(
    <TangibleInfoModal 
      visible={baseProps.visible}
      setVisible={mockSetVisible}
    />
  );
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });
});