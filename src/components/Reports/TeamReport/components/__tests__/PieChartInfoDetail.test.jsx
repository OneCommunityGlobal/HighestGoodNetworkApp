import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PieChartInfoDetail from '../PieChartInfoDetail';

describe('PieChartInfoDetail Component', () => {
  test('test_render_keyName_and_value', () => {
    render(<PieChartInfoDetail keyName="Test Key" value="123" color="#000000" darkMode={false} />);
    expect(screen.getByText('Test Key')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  test('test_apply_darkMode_class', () => {
    render(<PieChartInfoDetail keyName="Test Key" value="123" color="#000000" darkMode />);
    expect(screen.getByText('Test Key')).toHaveClass('text-light');
    expect(screen.getByText('123')).toHaveClass('text-light');
  });

  test('test_apply_legend_square_color', () => {
    render(<PieChartInfoDetail keyName="Test Key" value="123" color="#ff0000" darkMode={false} />);
    const legendSquare = screen.getByTestId('legend-color-square');
    expect(legendSquare).toHaveStyle('background-color: #ff0000');
  });

  test('test_render_keyName_and_value_with_darkMode', () => {
    render(<PieChartInfoDetail keyName="Test Key" value="123" color="#000000" darkMode />);
    expect(screen.getByText('Test Key')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Test Key')).toHaveClass('text-light');
    expect(screen.getByText('123')).toHaveClass('text-light');
  });

  test('test_render_with_specific_margin_styles', () => {
    render(<PieChartInfoDetail keyName="Test Key" value="123" color="#000000" darkMode={false} />);
    const valueElement = screen.getByText('123');
    expect(valueElement).toHaveStyle('margin-top: 16px');
    expect(valueElement).toHaveStyle('margin-left: 120px');
  });

  test('test_render_with_different_color_and_darkMode_combinations', () => {
    render(<PieChartInfoDetail keyName="Test Key" value="123" color="#00ff00" darkMode />);
    expect(screen.getByText('Test Key')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Test Key')).toHaveClass('text-light');
    expect(screen.getByText('123')).toHaveClass('text-light');
  });

  test('test_apply_special_key_class_when_keyName_is_Special', () => {
    render(<PieChartInfoDetail keyName="Special" value="123" color="#000000" darkMode={false} />);
    expect(screen.getByText('Special')).toHaveClass('pie-chart-info-key');
  });
});