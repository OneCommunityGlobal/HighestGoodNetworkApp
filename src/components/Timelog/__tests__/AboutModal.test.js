// AboutModal.test.js
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AboutModal from '../TimeEntryForm/AboutModal'; // Adjust the path as necessary

describe('AboutModal Component', () => {
  const mockSetVisible = jest.fn();

  const baseProps = {
    visible: true,
    setVisible: mockSetVisible,
  };

  it('should render the modal when visible is true', () => {
    const { getByText, getAllByText } = render(
      <AboutModal visible={baseProps.visible} setVisible={baseProps.setVisible} />
    );
    expect(getByText('Info')).toBeInTheDocument();
    expect(getAllByText(/This is the One Community time clock!/i)).toBeTruthy();
    // You can add more assertions for other paragraphs if needed
  });

  it('should not render the modal when visible is false', () => {
    const { queryByText } = render(
      <AboutModal visible={false} setVisible={baseProps.setVisible} />
    );
    expect(queryByText('Info')).not.toBeInTheDocument();
  });

  it('should render Close button and trigger setVisible on click', () => {
    const { getByText } = render(
      <AboutModal visible={baseProps.visible} setVisible={baseProps.setVisible} />
    );
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });
});
