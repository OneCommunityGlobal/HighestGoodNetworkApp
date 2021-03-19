import React from 'react';
import TextSearchBox from '../UserManagement/TextSearchBox';
import DropDownSearchBox from '../UserManagement/DropDownSearchBox';
import {
  Button
} from 'reactstrap';


const BadgeTableFilter = (props) => {
  const badgeCategory = ["Economics", "Education", "Energy", "Food", "Society", "Stewardship", "Other", "Unspecified"];
  const onBadgeNameSearch = (text) => {
    props.onBadgeNameSearch(text);
  }

  const orders = ["Ascending", "Descending"]

  const onBadgeDescriptionSearch = (text) => {
    props.onBadgeDescriptionSearch(text);
  }

  const onBadgeProjectSearch = (text) => {
    props.onBadgeProjectSearch(text);
  }

  const onBadgeCategorySearch = (text) => {
    props.onBadgeCategorySearch(text);
  }
  const onBadgeRankingSort = (order) => {
    props.onBadgeRankingSort(order);
  }

  return (
    <tr>
      <td id="badge_image"></td>
      <td id="badge_name">
        <TextSearchBox id={"badge_name_search"}
          searchCallback={onBadgeNameSearch}
          value={props.name}
        />
      </td>
      <td id="badge_description">
        <TextSearchBox id={"badge_description_search"}
          searchCallback={onBadgeDescriptionSearch}
          value={props.description}
        />
      </td>
      <td id="badge_category">
        <DropDownSearchBox id={"badge_category_search"}
          items={badgeCategory}
          searchCallback={onBadgeCategorySearch}
          value={props.category}
        />
      </td>
      <td id="badge_projcet">
        <TextSearchBox id={"badge_project_search"}
          searchCallback={onBadgeProjectSearch}
          value={props.project}
        />
      </td>
      <td id="badge_ranking">
        <DropDownSearchBox id={"badge_ranking_sort"}
          items={orders}
          searchCallback={onBadgeRankingSort}
          value={props.order}
        />
      </td>
      <td id="badge_action"><Button outline color="secondary" size="sm" onClick={() => props.resetFilters()}>Reset Filters</Button></td>
    </tr>
  );
};

export default BadgeTableFilter;
