import React from 'react';
import { Button } from 'reactstrap';
import { boxStyle } from 'styles';
import TextSearchBox from '../UserManagement/TextSearchBox';
import DropDownSearchBox from '../UserManagement/DropDownSearchBox';

function BadgeTableFilter(props) {
  const badgeTypes = [
    'No Infringement Streak',
    'Minimum Hours Multiple',
    'Personal Max',
    'Most Hrs in Week',
    'X Hours for X Week Streak',
    'Lead a team of X+',
    'Total Hrs in Category',
    'Custom',
  ];
  const onBadgeNameSearch = text => {
    props.onBadgeNameSearch(text);
  };

  const orders = ['Ascending', 'Descending'];

  const onBadgeDescriptionSearch = text => {
    props.onBadgeDescriptionSearch(text);
  };

  const onBadgeTypeSearch = text => {
    props.onBadgeTypeSearch(text);
  };
  const onBadgeRankingSort = order => {
    props.onBadgeRankingSort(order);
  };

  return (
    <tr>
      <td id="badge_image" />
      <td id="badge_name">
        <TextSearchBox
          id="badge_name_search"
          searchCallback={onBadgeNameSearch}
          value={props.name}
        />
      </td>
      <td id="badge_description">
        <TextSearchBox
          id="badge_description_search"
          searchCallback={onBadgeDescriptionSearch}
          value={props.description}
        />
      </td>
      <td id="badge_type">
        <DropDownSearchBox
          id="badge_types_search"
          items={badgeTypes}
          searchCallback={onBadgeTypeSearch}
          value={props.type}
        />
      </td>
      <td id="badge_details" />
      <td id="badge_ranking">
        <DropDownSearchBox
          id="badge_ranking_sort"
          items={orders}
          searchCallback={onBadgeRankingSort}
          value={props.order}
        />
      </td>
      <td id="badge_action">
        <Button
          outline
          color="secondary"
          size="sm"
          onClick={() => props.resetFilters()}
          style={boxStyle}
        >
          Reset Filters
        </Button>
      </td>
    </tr>
  );
}

export default BadgeTableFilter;
