import { Row, Col, Label } from 'reactstrap';

function ProjectSummary({ project }) {
  const {
    hoursWorked,
    totalMaterialsCost,
    totalEquipmentCost,
    mostMaterialWaste,
    members,
    mostMaterialBought,
    leastMaterialAvailable,
  } = project;

  return (
    <div className="project-summary_content">
      <Row className="project-summary_header mx-auto">
        <h2>{project.name} summary</h2>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="5">
          <Label className="project-summary_label">Total hours of work done:</Label>
        </Col>
        <Col xs="7">
          <span className="project-summary_span">{hoursWorked}</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="5">
          <Label className="project-summary_label">Total cost of materials:</Label>
        </Col>
        <Col xs="7">
          <span className="project-summary_span">{totalMaterialsCost} USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="5">
          <Label className="project-summary_label">Total cost of equipment:</Label>
        </Col>
        <Col xs="7">
          <span className="project-summary_span">{totalEquipmentCost} USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="5">
          <Label className="project-summary_label">Waste:</Label>
        </Col>
        <Col xs="7">
          <span className="project-summary_span">
            {mostMaterialWaste.stockWasted} {mostMaterialWaste.itemType.unit} of{' '}
            {mostMaterialWaste.itemType.name} has been wasted!
          </span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="5">
          <Label className="project-summary_label">Total members:</Label>
        </Col>
        <Col xs="7">
          <span className="project-summary_span">{members.length}</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="5">
          <Label className="project-summary_label">Rentals:</Label>
        </Col>
        <Col xs="7">
          <span className="project-summary_span">Excavator 2 rental ends in 72 hours!</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="5">
          <Label className="project-summary_label">Most material bought:</Label>
        </Col>
        <Col xs="7">
          <span className="project-summary_span">
            {mostMaterialBought.stockBought} {mostMaterialBought.itemType.unit} of{' '}
            {mostMaterialBought.itemType.name} purchased for this project
          </span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="5">
          <Label className="project-summary_label">Stock:</Label>
        </Col>
        <Col xs="7">
          <span className="project-summary_span">
            {leastMaterialAvailable.itemType.name} is nearly out of stock (
            {leastMaterialAvailable.stockAvailable} {leastMaterialAvailable.itemType.unit}{' '}
            remaining)
          </span>
        </Col>
      </Row>
    </div>
  );
}

export default ProjectSummary;
