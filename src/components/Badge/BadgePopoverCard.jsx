import { Card, CardBody, CardImg, CardText, CardTitle, UncontrolledPopover } from 'reactstrap';

function BadgePopoverCard({ target, badge }) {
  return (
    <UncontrolledPopover trigger="hover" target={target}>
      <Card className="text-center">
        <CardImg className="badge_image_lg" src={badge?.imageUrl} />
        <CardBody>
          <CardTitle
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: '#285739',
              marginBottom: 15,
            }}
          >
            {badge?.badgeName}
          </CardTitle>
          <CardText>{badge?.description}</CardText>
        </CardBody>
      </Card>
    </UncontrolledPopover>
  );
}

export default BadgePopoverCard;
