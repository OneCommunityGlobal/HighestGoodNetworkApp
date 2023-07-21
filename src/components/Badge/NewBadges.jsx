import React from 'react';
import { Card, CardTitle, CardBody, UncontrolledTooltip } from 'reactstrap';
import BadgeImage from './BadgeImage';
import { WEEK_DIFF } from '../../constants/badge';

const NewBadges = props => {
  const filterBadges = allBadges => {
    let filteredList = allBadges.filter(
      value => Date.now() - new Date(value.lastModified).getTime() <= WEEK_DIFF,
    );

    filteredList.sort((a, b) => {
      if (a.badge.ranking === 0) return 1;
      if (b.badge.ranking === 0) return -1;
      if (a.badge.ranking > b.badge.ranking) return 1;
      if (a.badge.ranking < b.badge.ranking) return -1;
      if (a.badge.badgeName > b.badge.badgeName) return 1;
      if (a.badge.badgeName < b.badge.badgeName) return -1;
    });
    return filteredList;
  };

  let filteredBadges = filterBadges(props.badges);

  return (
    <>
      <Card style={{ backgroundColor: '#f6f6f3' }}>
        <CardBody>
          <CardTitle
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: '#285739',
              marginBottom: 15,
            }}
          >
            New Badges Earned <i className="fa fa-info-circle" id="NewBadgeInfo" />
          </CardTitle>
          <div className="new_badges">
            {filteredBadges.length == 0 ? (
              <strong style={{ opacity: 0.7 }}>
                Get yourself a herd of new badges! New badges are earned at the close of each epic
                week. Newest badges are placed here at the top for a week after you earn them so
                everyone can bask in the awesomeness of your achievement(s)!
              </strong>
            ) : (
              ''
            )}
            {filteredBadges.map((value, index) => (
              <BadgeImage
                time="new"
                count={value.count}
                badgeData={value.badge}
                index={index}
                key={index}
              />
            ))}
          </div>
        </CardBody>
      </Card>
      <UncontrolledTooltip
        placement="right"
        target="NewBadgeInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          Right on Superstar, if you&apos;ve got badges in this section, they are the ones
          you&apos;ve earned in JUST THE LAST WEEK! If you already earned a badge before, that badge
          will pop up here from the section below and you will see the count increased. How cool is
          that?!?
        </p>
      </UncontrolledTooltip>
    </>
  );
};

export default NewBadges;
