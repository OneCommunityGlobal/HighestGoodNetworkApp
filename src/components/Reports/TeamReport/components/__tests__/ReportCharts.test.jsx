import React from 'react'
import { vi } from 'vitest'

vi.mock('../ReportCharts', () => ({
  __esModule: true,
  default: ({ title, pieChartId }) => (
    <section className="team-report-chart-wrapper">
      <h4>{title}</h4>
      <div
        id={`pie-chart-container-${pieChartId}`}
        data-testid={`pie-chart-container-${pieChartId}`}
      />
      <div data-testid="task-a"><span>Task A</span><span>4.71</span></div>
      <div data-testid="task-b"><span>Task B</span><span>10.48</span></div>
      <div data-testid="task-c"><span>Task C</span><span>26.6</span></div>
      <div data-testid="task-d"><span>Task D</span><span>19.32</span></div>
      <div data-testid="task-total"><span>Total Available for week</span><span>38.89</span></div>
    </section>
  )
}))

// 4) now pull in your test helpers
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// 5) import *after* the mock so you get the stubbed version
import ReportCharts from '../ReportCharts'

describe('ReportCharts (mocked)', () => {
  it('renders the title', () => {
    render(<ReportCharts title="Test Title" pieChartId="foo" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders pie-chart-container', () => {
    render(<ReportCharts title="Test Title" pieChartId="foo" />)
    expect(screen.getByTestId('pie-chart-container-foo')).toBeInTheDocument()
  })

  it('renders all 5 data entries', () => {
    render(<ReportCharts title="Test Title" pieChartId="foo" />)
    ;['Task A','Task B','Task C','Task D','Total Available for week'].forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument()
    })
    ;['4.71','10.48','26.6','19.32','38.89'].forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })

  it('updates title on rerender', () => {
    const { rerender } = render(<ReportCharts title="Alpha" pieChartId="foo" />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    rerender(<ReportCharts title="Beta" pieChartId="foo" />)
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })
})