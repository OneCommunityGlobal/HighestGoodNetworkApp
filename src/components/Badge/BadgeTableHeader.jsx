import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';

const BadgeTableHeader = () => (
  <tr>
    <th>Badge</th>
    <th>Name</th>
    <th className='d-xl-table-cell d-none'>Description</th>
    <th>Type</th>
    <th className='d-xl-table-cell d-none'>Details</th>
    <th>
      Ranking <i className="fa fa-info-circle" id="SortRankingInfo" style={{ marginLeft: '5px' }} />
      <UncontrolledTooltip
        placement="right"
        target="SortRankingInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          {' '}
          Sort the number by ascending or descending order. The lower the number (other than zero)
          the higher the badge ranking.
        </p>
        <p className="badge_info_icon_text">
          {' '}
          Note that 0 is treated as the largest number (thus the lowest ranking). When no number is
          specified for the ranking field, the default value is 0.{' '}
        </p>
        <p className="badge_info_icon_text">
          All badges of the same number in ranking sort alphabetically by their names.
        </p>
      </UncontrolledTooltip>
    </th>
    <th>Action</th>
    <th>Reports Page Notification</th>
  </tr>
);

export default BadgeTableHeader;
