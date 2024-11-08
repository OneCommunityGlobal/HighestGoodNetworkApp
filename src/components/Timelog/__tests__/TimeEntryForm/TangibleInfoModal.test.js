// TangibleInfoModal.test.js
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TangibleInfoModal from '../../TimeEntryForm/TangibleInfoModal'; // Adjust the path as necessary

describe('TangibleInfoModal Component', () => {
  const mockSetVisible = jest.fn();

  const baseProps = {
    visible: true,
    setVisible: mockSetVisible,
  };

  it('should render the modal when visible is true', () => {
    const { getByText } = render(
      <TangibleInfoModal
        visible={baseProps.visible}
        setVisible={baseProps.setVisible}
      />
    );
    expect(getByText('Info')).toBeInTheDocument();
    expect(
      getByText(
        /Intangible time is time logged to items not related to your specific action items/i
      )
    ).toBeInTheDocument();
  });

  it('should not render the modal when visible is false', () => {
    const { queryByText } = render(
      <TangibleInfoModal
        visible={false}
        setVisible={baseProps.setVisible}
      />
    );
    expect(queryByText('Info')).not.toBeInTheDocument();
  });

  it('should render Close button and trigger setVisible on click', () => {
    const { getByText } = render(
      <TangibleInfoModal
        visible={baseProps.visible}
        setVisible={baseProps.setVisible}
      />
    );
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });

  it('should conditionally render the Cancel button based on edit and data comparison', () => {
    // Case where Cancel button should be rendered
    const propsWithEdit = {
      visible: baseProps.visible,
      setVisible: baseProps.setVisible,
      reminder: baseProps.reminder,
      edit: true,
      inputs: { hours: 2, minutes: 30 },
      cancelChange: jest.fn(),
      data: { hours: 1, minutes: 30 },
    };
    const { getByText, rerender } = render(
      <TangibleInfoModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={propsWithEdit.inputs}
        cancelChange={propsWithEdit.cancelChange}
        data={propsWithEdit.data}
      />
    );
    expect(getByText('Cancel')).toBeInTheDocument();

    // Case where Cancel button should not be rendered
    rerender(
      <TangibleInfoModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={{ hours: 1, minutes: 30 }}
        cancelChange={propsWithEdit.cancelChange}
        data={propsWithEdit.data}
      />
    );
    expect(() => getByText('Cancel')).toThrow();
  });

  it('should call cancelChange when Cancel button is clicked', () => {
    const propsWithEdit = {
      visible: baseProps.visible,
      setVisible: baseProps.setVisible,
      reminder: baseProps.reminder,
      edit: true,
      inputs: { hours: 2, minutes: 30 },
      cancelChange: jest.fn(),
      data: { hours: 1, minutes: 30 },
    };
    const { getByText } = render(
      <TangibleInfoModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={propsWithEdit.inputs}
        cancelChange={propsWithEdit.cancelChange}
        data={propsWithEdit.data}
      />
    );
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(propsWithEdit.cancelChange).toHaveBeenCalled();
  });
});
