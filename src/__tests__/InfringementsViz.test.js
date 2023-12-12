import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import InfringementsViz from 'components/Reports/InfringementsViz';

describe('InfringementsViz component', () => {
  it('renders without crashing', () => {
    render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);
    // Check if the component renders without errors
  });

  it('renders button to show graph', () => {
    const { getByText } = render(<InfringementsViz infringements={[]} />);
    const showGraphButton = getByText('Show Infringements Graph');
    expect(showGraphButton).toBeInTheDocument();
  });

  it('does not display the modal initially', () => {
    const { queryByText } = render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);

    const modalTitle = queryByText('Infringement');
    expect(modalTitle).not.toBeInTheDocument();
  });

  it('renders the graph when the "Show Infringements Graph" button is clicked', () => {
    const { getByText, container } = render(
      <InfringementsViz infringements={[]} fromDate="" toDate="" />,
    );

    const showButton = getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    const graph = container.querySelector('#infplot'); // Use querySelector to find element by its ID
    expect(graph).toBeInTheDocument();
  });

  it('displays the modal when the "Show Infringements Graph" button is clicked', () => {
    const { getByText, queryByText } = render(
      <InfringementsViz infringements={[]} fromDate="" toDate="" />,
    );

    const showButton = getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // Check if the modal content is displayed
    const modalTitle = queryByText('Infringement');
    expect(modalTitle).toBeInTheDocument();
  });

  it('displays close button when the "Show Infringements Graph" button is clicked', () => {
    const { getByText, getAllByRole } = render(
      <InfringementsViz infringements={[]} fromDate="" toDate="" />,
    );

    const showButton = getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // Check if the Close button is displayed
    const closeButtons = getAllByRole('button', { name: 'Close' });
    const closeButton = closeButtons.find(button => button.tagName.toLowerCase() === 'button');
    expect(closeButton).toBeInTheDocument();
  });

  it('modal closes when "Close" button in the modal footer is clicked', () => {
    const { getByText, getAllByRole, queryByText } = render(
      <InfringementsViz infringements={[]} fromDate="" toDate="" />,
    );

    const showButton = getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    const closeButtons = getAllByRole('button', { name: 'Close' });
    const closeButton = closeButtons.find(button => button.tagName.toLowerCase() === 'button');
    fireEvent.click(closeButton);

    const modalElement = queryByText('Infringement ');
    expect(modalElement).not.toBeInTheDocument();
  });
});
