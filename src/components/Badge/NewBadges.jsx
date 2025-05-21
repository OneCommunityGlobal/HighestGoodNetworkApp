import { Card, CardTitle, CardBody, UncontrolledTooltip } from 'reactstrap';
import BadgeImage from './BadgeImage';
import { WEEK_DIFF } from '../../constants/badge';
import './Badge.css';

function NewBadges(props) {
  const filterBadges = allBadges => {
    try {
      const filteredList = allBadges.filter(
        value => Date.now() - new Date(value.lastModified).getTime() <= WEEK_DIFF,
      );

      filteredList &&
        filteredList.sort((a, b) => {
          if (a?.badge?.ranking === 0) return 1;
          if (b?.badge?.ranking === 0) return -1;
          if (a?.badge?.ranking > b?.badge?.ranking) return 1;
          if (a?.badge?.ranking < b?.badge?.ranking) return -1;
          if (a?.badge?.badgeName > b?.badge?.badgeName) return 1;
          if (a?.badge?.badgeName < b?.badge?.badgeName) return -1;
          return 0;
        });
      return filteredList;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const filteredBadges = filterBadges(props.badges);

  return (
    <>
      <Card
        style={{ backgroundColor: props.darkMode ? '#3A506B' : '#f6f6f3', padding: '0px 10px' }}
      >
        <CardBody>
          <CardTitle
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: props.darkMode ? '#FFF' : '#285739',
              marginBottom: 15,
            }}
            className="responsive-font-size"
          >
            New Badges Earned <i className="fa fa-info-circle" id="NewBadgeInfo" />
          </CardTitle>
          <div className={`new_badges ${props.darkMode ? 'text-light' : ''}`}>
            {filteredBadges.length === 0 ? (
              <strong style={{ opacity: 0.7 }} className="responsive-font-size">
                Get yourself a herd of new badges! New badges are earned at the close of each epic
                week. Newest badges are placed here at the top for a week after you earn them so
                everyone can bask in the awesomeness of your achievement(s)!
              </strong>
            ) : (
              ''
            )}
            {filteredBadges.map((value, index) => (
              <BadgeImage
                personalBestMaxHrs={props.personalBestMaxHrs}
                time="new"
                count={value?.count}
                badgeData={value?.badge}
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
}

export default NewBadges;
