import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ReportCard } from '../ReportCard';

describe('ReportCard component', () => {
  it('renders without crashing', () => {
    render(<ReportCard />)
  })
})
