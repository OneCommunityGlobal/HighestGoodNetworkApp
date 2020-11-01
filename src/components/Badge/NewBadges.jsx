import React, { useState } from 'react';
import {
  Card, CardTitle, CardBody, Popover, PopoverHeader, PopoverBody
} from 'reactstrap';

const NewBadges = () => {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <Card style={{ backgroundColor: '#f6f6f3' }}>
      <CardBody >
        <CardTitle
          style={{
            fontWeight: 'bold',
            fontSize: 18,
            color: '#285739',
            marginBottom: 15
          }}
        >
          New Badges Earned
      </CardTitle>
        <div className="new_badges badge_image_sm">
          <img src="badges/sample7.jpeg" alt="badge sample 7" id="popover1" />
          <Popover isOpen={isOpen} toggle={toggle} target="popover1">
            <PopoverHeader>3000 Hours Education</PopoverHeader>
            <PopoverBody className="badge_image_lg">
              <img src="badges/sample7.jpeg" alt="badge sample 7" />
              <p>This badge belongs to the Education category, and the HGN Software Development project. People who earn this badge have completed 3000 hours of computer science courses. This badge has a ranking of 21. </p>
            </PopoverBody>
          </Popover>
          <img src="badges/sample8.jpeg" alt="badge sample 8" />
          <img src="badges/sample9.jpeg" alt="badge sample 9" />
          <img src="badges/sample10.jpeg" alt="badge sample 10" />
          <img src="badges/sample11.jpeg" alt="badge sample 11" />
          <img src="badges/sample12.jpeg" alt="badge sample 12" />
          <img src="badges/sample13.jpeg" alt="badge sample 13" />
          <img src="badges/sample14.png" alt="badge sample 14" />
          <img src="badges/sample15.jpeg" alt="badge sample 15" />
          <img src="badges/sample5.jpeg" alt="badge sample 5" />
        </div>
      </CardBody>
    </Card >
  );
};

export default NewBadges;