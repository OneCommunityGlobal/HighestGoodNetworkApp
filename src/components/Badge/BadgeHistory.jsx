import React, { useState } from 'react';
import { Popover, Card, CardTitle, CardBody, CardImg, CardText } from 'reactstrap';
import './Badge.css';


const BadgeHistory = () => {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);


  return (
    <div className="badge_image_sm">
      <img src="https://www.dropbox.com/s/meoh1eueb97ns0y/5%2C000hrsInfrastrucure_200px.png?raw=1" alt="dropbox new 1" />
      <img src="https://www.dropbox.com/s/dmqtz2k63ew9jd7/30PlusTeam_200px.png?raw=1" alt="dropbox new 2" />
      <img src="https://www.dropbox.com/s/nr2afwylpaqudf8/40hrStreak_200px.png?raw=1" alt="dropbox new 3" />
      <img src="https://www.dropbox.com/s/pecypq02hp6805d/90hrStrk_200px.png?raw=1" alt="dropbox new 4" />
      <img src="https://www.dropbox.com/s/nsvn7x0p4ve0by7/150WksInARow_200px.png?raw=1" alt="dropbox new 5" id="popover2" />
      <Popover trigger="hover" isOpen={isOpen} toggle={toggle} target="popover2">
        <Card>
          <CardImg className="badge_image_lg" src="https://www.dropbox.com/s/nsvn7x0p4ve0by7/150WksInARow_200px.png?raw=1" alt="dropbox new 5" />
          <CardBody>
            <CardTitle
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: '#285739',
                marginBottom: 15
              }}>150 Weeks of 60 Hours</CardTitle>
            <CardText>This badge belongs to the Infrastructure category, and the Duplicable City Center project. People who earn this badge have committed 60 hours per week for 150 weeks. This badge has a ranking of 5.</CardText>
          </CardBody>
        </Card>
      </Popover>
      <img src="badges/sample1.jpeg" alt="badge sample 1" />
      <img src="badges/sample2.jpeg" alt="badge sample 2" />
      <img src="badges/sample3.jpeg" alt="badge sample 3" />
      <img src="badges/sample4.png" alt="badge sample 4" />
      <img src="badges/sample5.jpeg" alt="badge sample 5" />
      <img src="badges/sample6.jpeg" alt="badge sample 6" />
      <img src="badges/sample7.jpeg" alt="badge sample 7" />
      <img src="badges/sample8.jpeg" alt="badge sample 8" />
      <img src="badges/sample9.jpeg" alt="badge sample 9" />
      <img src="badges/sample10.jpeg" alt="badge sample 10" />
      <img src="badges/sample11.jpeg" alt="badge sample 11" />
      <img src="badges/sample12.jpeg" alt="badge sample 12" />
      <img src="badges/sample13.jpeg" alt="badge sample 13" />
      <img src="badges/sample14.png" alt="badge sample 14" />
      <img src="badges/sample15.jpeg" alt="badge sample 15" />
      <img src="badges/sample5.jpeg" alt="badge sample 5" />
      <img src="badges/sample6.jpeg" alt="badge sample 6" />
      <img src="badges/sample7.jpeg" alt="badge sample 7" />
      <img src="badges/sample8.jpeg" alt="badge sample 8" />
      <img src="badges/sample9.jpeg" alt="badge sample 9" />
      <img src="badges/sample10.jpeg" alt="badge sample 10" />
      <img src="badges/sample11.jpeg" alt="badge sample 11" />
      <img src="badges/sample12.jpeg" alt="badge sample 12" />
      <img src="badges/sample13.jpeg" alt="badge sample 13" />
      <img src="badges/sample14.png" alt="badge sample 14" />
      <img src="badges/sample15.jpeg" alt="badge sample 15" />
      <img src="badges/sample2.jpeg" alt="badge sample 2" />
      <img src="badges/sample3.jpeg" alt="badge sample 3" />
      <img src="badges/sample4.png" alt="badge sample 4" />
      <img src="badges/sample5.jpeg" alt="badge sample 5" />
      <img src="badges/sample6.jpeg" alt="badge sample 6" />
      <img src="badges/sample7.jpeg" alt="badge sample 7" />
      <img src="badges/sample8.jpeg" alt="badge sample 8" />
      <img src="badges/sample9.jpeg" alt="badge sample 9" />
      <img src="badges/sample10.jpeg" alt="badge sample 10" />
      <img src="badges/sample11.jpeg" alt="badge sample 11" />
      <img src="badges/sample12.jpeg" alt="badge sample 12" />
      <img src="badges/sample13.jpeg" alt="badge sample 13" />
      <img src="badges/sample14.png" alt="badge sample 14" />
      <img src="badges/sample15.jpeg" alt="badge sample 15" />
      <img src="badges/sample5.jpeg" alt="badge sample 5" />
      <img src="badges/sample6.jpeg" alt="badge sample 6" />
      <img src="badges/sample7.jpeg" alt="badge sample 7" />
      <img src="badges/sample8.jpeg" alt="badge sample 8" />
      <img src="badges/sample9.jpeg" alt="badge sample 9" />
      <img src="badges/sample10.jpeg" alt="badge sample 10" />
      <img src="badges/sample11.jpeg" alt="badge sample 11" />
      <img src="badges/sample12.jpeg" alt="badge sample 12" />
      <img src="badges/sample13.jpeg" alt="badge sample 13" />
      <img src="badges/sample14.png" alt="badge sample 14" />
      <img src="badges/sample15.jpeg" alt="badge sample 15" />
    </div>
  );
};

export default BadgeHistory;
