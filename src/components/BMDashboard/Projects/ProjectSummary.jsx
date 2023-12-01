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
          {/* TO DO: */}
          <Label className="project-summary_label">Waste:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">___ of ____ has been wasted!</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">Total members:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">{project.members.length}</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          <Label className="project-summary_label">Rentals:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">Excavator 2 rental ends in 72 hours!</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          {/* TO DO: */}
          <Label className="project-summary_label">Most material bought:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">___of ___ purchased for this project</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs="6">
          {/* TO DO: */}
          <Label className="project-summary_label">Stock:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">___ is nearly out of stock (___ remaining)</span>
        </Col>
      </Row>
    </div>
  );
}

export default ProjectSummary;
