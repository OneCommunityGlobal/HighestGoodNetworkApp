import { Row, Col, Label } from 'reactstrap';

function ProjectSummary({ project }) {

  return (
    <div className="project-summary_content">
      <Row className="project-summary_header mx-auto">
        <h2>{project.name} summary</h2>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">Total hours of work done:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">{project.hoursWorked}</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">Total cost of materials:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">{project.totalMaterialsCost} USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">Total cost of equipment:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">{project.totalEquipmentCost} USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">Wastage:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">TBD</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">No of teams:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">{project.teamCount}</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">Total number of tools or equipment: </Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">5</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">Equipment return due in 72hrs:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">Yes</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">
            Number of materials with quantity less than 20% left:
          </Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">None</span>
        </Col>
      </Row>
    </div>
  );
}

export default ProjectSummary;
