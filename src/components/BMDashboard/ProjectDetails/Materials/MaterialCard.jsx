import { Card, CardImg, CardBody, CardTitle } from 'reactstrap';

function MaterialCard() {
  return (
    <Card className="materialCard">
      <CardImg alt="" src="https://www.theforkliftcenter.com/images/forklift-hero-left.png" top />
      <CardBody>
        <CardTitle tag="h6">Card title</CardTitle>
        <div className="infoDiv">Term ends in __ hours.</div>
      </CardBody>
    </Card>
  );
}

export default MaterialCard;
