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

  test('test_render_keyName_and_value_with_darkMode', () => {
    const { getByText } = render(<PieChartInfoDetail keyName="Test Key" value="123" color="#000000" darkMode={true} />);
    expect(getByText('Test Key')).toBeInTheDocument();
    expect(getByText('123')).toBeInTheDocument();
    expect(getByText('Test Key')).toHaveClass('text-light');
    expect(getByText('123')).toHaveClass('text-light');
  });

  test('test_render_with_specific_margin_styles', () => {
    const { getByText } = render(<PieChartInfoDetail keyName="Test Key" value="123" color="#000000" darkMode={false} />);
    const valueElement = getByText('123');
    expect(valueElement).toHaveStyle('margin-top: 16px');
    expect(valueElement).toHaveStyle('margin-left: 120px');
  });

  test('test_render_with_different_color_and_darkMode_combinations', () => {
    const { getByText } = render(<PieChartInfoDetail keyName="Test Key" value="123" color="#00ff00" darkMode={true} />);
    expect(getByText('Test Key')).toBeInTheDocument();
    expect(getByText('123')).toBeInTheDocument();
    expect(getByText('Test Key')).toHaveClass('text-light');
    expect(getByText('123')).toHaveClass('text-light');
  });

  test('test_apply_special_key_class_when_keyName_is_Special', () => {
    const { getByText } = render(<PieChartInfoDetail keyName="Special" value="123" color="#000000" darkMode={false} />);
    expect(getByText('Special')).toHaveClass('pie-chart-info-key');
  });
});