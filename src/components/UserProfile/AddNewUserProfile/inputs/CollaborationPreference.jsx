import { FormGroup, Input, Row, Col, Label} from 'reactstrap'

const CollaborationPreference = props => {
  const { formik } = props

  return (
    <FormGroup>
      <Row>
        <Col>
          <Label htmlFor="collaborationPreference">Video Call Preference</Label>
        </Col>
        <Col>
          <Input
            name="collaborationPreference"
            id="collaborationPreference"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            valid={formik.touched.collaborationPreference && !formik.errors.collaborationPreference}
            invalid={
              formik.touched.collaborationPreference && formik.errors.collaborationPreference
            }
            placeholder="Zoom, skype, etc"
          />
        </Col>
      </Row>
    </FormGroup>
  )
}

export default CollaborationPreference
