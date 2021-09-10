import { FormGroup, Row, Col, Label } from 'reactstrap'

const Role = props => {
  const { formik } = props

  return (
    <Row>
      <Col>
        <Label>Role</Label>
      </Col>
      <Col>
        <FormGroup>
          <select
            value={formik.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            id="role"
            name="role"
            className="form-control"
            defaultValue="Volunteer"
          >
            <option value="Administrator">Administrator</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Manager">Manager</option>
            <option value="Core Team">Core Team</option>
          </select>
        </FormGroup>
      </Col>
    </Row>
  )
}

export default Role
