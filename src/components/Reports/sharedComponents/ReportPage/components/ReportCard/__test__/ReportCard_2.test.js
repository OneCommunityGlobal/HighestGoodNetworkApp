import React from 'react';
import { render } from '@testing-library/react';
import { ReportCard } from '../ReportCard_2';

describe('ReportCard_2 component', () => {
  it('renders without crashing', () => {
    render(<ReportCard />)
  })
})
