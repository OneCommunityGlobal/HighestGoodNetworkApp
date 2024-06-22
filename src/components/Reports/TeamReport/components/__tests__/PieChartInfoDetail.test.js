import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PieChartInfoDetail from '../PieChartInfoDetail';

describe('PieChartInfoDetail Component', () => {
  test('test_render_keyName_and_value', () => {
    const { getByText } = render(<PieChartInfoDetail keyName="Test Key" value="123" color="#000000" darkMode={false} />);
    expect(getByText('Test Key')).toBeInTheDocument();
    expect(getByText('123')).toBeInTheDocument();
  });

  test('test_apply_darkMode_class', () => {
    const { getByText } = render(<PieChartInfoDetail keyName="Test Key" value="123" color="#000000" darkMode={true} />);
    expect(getByText('Test Key')).toHaveClass('text-light');
    expect(getByText('123')).toHaveClass('text-light');
  });

  test('test_apply_legend_square_color', () => {
    const { container } = render(<PieChartInfoDetail keyName="Test Key" value="123" color="#ff0000" darkMode={false} />);
    const legendSquare = container.querySelector('.pie-chart-legend-color-square');
    expect(legendSquare).toHaveStyle('background-color: #ff0000');
  });
});