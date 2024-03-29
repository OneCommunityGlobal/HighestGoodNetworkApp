import React from 'react';
import { Card, CardTitle, CardText, Button, CardBody, Container, Row, Col } from 'reactstrap';
import parse from 'html-react-parser';
import { useDispatch } from 'react-redux';
import { markNotificationAsRead } from '../../actions/notificationAction';
import { convertDateFormatToMMMDDYY } from '../../utils/formatDate';

// Mock data
// const URL_TO_BLUE_SQUARE_PAGE = 'https://google.com';

// const messageMockDate = `
// <p> Welcome as one of our newest members to the One Community team and family!
// Heads up we’ve removed a <a href=${URL_TO_BLUE_SQUARE_PAGE}>“blue square”</a> that
// was issued due to not completing your hours and/or summary this past week. The reason we removed
// this blue square is because you didn’t have the full week available to complete your volunteer
// time with us. </p>

// <p> If you’d like to learn more about this policy and/or blue squares, click here:
// <a href=${URL_TO_BLUE_SQUARE_PAGE}> “Blue Square FAQ”</a>
// </p>

// <p>Welcome again, we’re glad to have you joining us! </p>

// <p>With Gratitude,</br>One Community </p>
// `;

// const mockData = {
//   _id: '1',
//   message: messageMockDate,
//   sender: {
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'test@gmail.com',
//   },
//   recipient: {
//     firstName: 'Jane',
//     lastName: 'Doe',
//     email: 'test@gmail.com',
//   },
//   isSystemGenerated: true,
//   createdTimeStamps: '2021-09-01T00:00:00.000Z',
// };

/**
 * NotificationCard: displays notification messages in the header component.
 * In the future, we could use this component for different types of notifications (e.g., critical, info).
 * */
function NotificationCard({ notification }) {
  const dispatch = useDispatch();
  // const { _id, message, sender, isSystemGenerated } = mockData;
  const { _id, message, sender, isSystemGenerated, createdTimeStamps } = notification;
  const { firstName: senderFirstName, lastName: senderLastName } = sender;
  const senderFullName = `${senderFirstName} ${senderLastName}`;

  // Fade animation state
  const [fade, setFade] = React.useState(false);

  // Replace the anchor tag with a styled anchor tag to acoomodate the card's background color.
  // We may use this to apply style to the text before parsing.
  const styledHtmlString = message.replace(
    /<a/g,
    '<a style="color: white; text-decoration: underline;"',
  );

  const onClickMarkAsRead = () => {
    setFade(true);
    dispatch(markNotificationAsRead(_id));
  };

  return (
    <Container fluid>
      <Card
        color="primary"
        className={fade ? 'fade' : ''}
        onAnimationEnd={() => setFade(false)}
        inverse
        style={{ marginRight: '15px', marginBottom: '5px' }}
      >
        <CardBody>
          <CardTitle tag="h5">
            <i className="fa fa-info-circle" id="TypeInfo" />
            {isSystemGenerated
              ? ' You have a new system notification!'
              : ` You have a new notification from ${senderFullName}!`}
          </CardTitle>
          <CardText>{parse(styledHtmlString)}</CardText>
          <CardText>Date: {convertDateFormatToMMMDDYY(createdTimeStamps)}</CardText>
          <Button onClick={onClickMarkAsRead}> Mark as Read </Button>
        </CardBody>
      </Card>
    </Container>
  );
}

export default NotificationCard;
