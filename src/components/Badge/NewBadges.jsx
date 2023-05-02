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

  // userProfile.personalBestMaxHrs

  console.log('>>>>>>>>>>>>>>')
  console.log(props)
  console.log('>>>>>>>>>>>>>>')

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


            {/*<div className="customBadge">
            <img src="https://uc240a2e5ce97e247522cf55f232.previews.dropboxusercontent.com/p/thumb/AB5C26_v-7pIZpyH9WODRLiTvBMKBEjtsM6EYmx62lHpd0LkyTddIMck0Md5_tjJ4rEb_PaObc1EHjE-uP75Hjbn-9bcAOYwguhK_xC9Octl15qI2xd3fvygu-oZUoPaB1e1ibL6BrxEMM2u6p_j46rqYGXgV8aC-ZE46qzsFQ1ylzJqOpsHmtCpGGMd6tfIeQAOrsRsPbKEJ3S9zyQTgSqOC-S1q6BIlyYFfs9JuDUzxZg3VDZQDygUBOEA1GSzqm84DFZAJfmpeF480-HcloPGJ_s3ORqr4mwP08apgI3EwA1M7QPY0ibc0EnCxlOUoeYWXAHidmN3eIL-S7zuzYbj-3I-95cgjoXhSvAoxKYA0r26aynUHVYfIp1okS0ivv7kd4uNRtzfxNSI1CH3jzH7vkFT8nXwgshFqjozbdHN2Q/p.png" />
            <div>{props.badges.length}</div>
            </div>*/}


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
          Right on Superstar, if you've got badges in this section, they are the ones you've earned
          in JUST THE LAST WEEK! If you already earned a badge before, that badge will pop up here
          from the section below and you will see the count increased. How cool is that?!?
        </p>
      </UncontrolledTooltip>
    </>
  );
};

export default NewBadges;
