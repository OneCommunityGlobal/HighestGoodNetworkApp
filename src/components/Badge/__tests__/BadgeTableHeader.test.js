import React from 'react';
import BadgeTableHeader from 'components/Badge/BadgeTableHeader';
import {renderWithProvider } from '__tests__/utils';

describe('BadgeTableHeader', () => {
  it('should render correctly', () => {
    renderWithProvider(<BadgeTableHeader />);
  });

  it('displays column name correctly', () => {
    const {getByText} = renderWithProvider(<BadgeTableHeader />);
    expect(getByText('Badge')).toBeInTheDocument();
    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Description')).toBeInTheDocument();
    expect(getByText('Type')).toBeInTheDocument();
    expect(getByText('Details')).toBeInTheDocument();
    expect(getByText('Ranking')).toBeInTheDocument();
    expect(getByText('Action')).toBeInTheDocument();
    expect(getByText('Reports Page Notification')).toBeInTheDocument();
  });

  it('should render tooltip properly', () => {
    const {getByText} = renderWithProvider(<BadgeTableHeader />);
    const ranking = getByText('Ranking');
    if(ranking){
      const rankingInfo = ranking.querySelector('#SortRankingInfo');
      expect(rankingInfo).toBeInTheDocument();
    }
  });
  
  
});