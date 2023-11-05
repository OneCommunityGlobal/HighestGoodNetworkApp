import React from 'react';
import { render } from '@testing-library/react';
import PieChartInfoDetail from 'components/Reports/TeamReport/components/PieChartInfoDetail';

describe('PieChartInfoDetail Component', () => {
  it('renders the keyName, value, and color correctly', () => {
    const keyName = 'Category A';
    const value = 42;
    const color = 'blue';

    const { getByText, container } = render(
      <PieChartInfoDetail keyName={keyName} value={value} color={color} />,
    );

    const keyNameElement = getByText(keyName);
    const valueElement = getByText(value.toString());
    // Find the color square by class name
    const colorSquareElement = container.querySelector('.pie-chart-legend-color-square');

    expect(keyNameElement).toBeInTheDocument();
    expect(valueElement).toBeInTheDocument();
    expect(colorSquareElement).toBeInTheDocument();
    // Checks the color square's background color matches the color prop.
    expect(colorSquareElement).toHaveStyle({ backgroundColor: color });
  });

  it('applies custom styles for value element', () => {
    const keyName = 'Category B';
    const value = 18;
    const color = 'red';

    const { getByText } = render(
      <PieChartInfoDetail keyName={keyName} value={value} color={color} />,
    );

    const valueElement = getByText(value.toString());
    // Checks if custom styles are correctly applied to the value element.
    expect(valueElement).toHaveStyle({ marginTop: '16px', marginLeft: '120px' });
  });
});
