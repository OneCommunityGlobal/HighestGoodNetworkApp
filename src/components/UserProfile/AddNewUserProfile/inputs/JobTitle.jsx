import { FormGroup, FormFeedback, Input, Row, Col, Label } from 'reactstrap'

const JobTitle = props => {
  const { formik } = props

  return (
    <FormGroup>
      <Row>
        <Col>
          <Label htmlFor="jobTitle">Job Title</Label>
        </Col>
        <Col>
          <Input
            id="jobTitle"
            name="jobTitle"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Job Title"
            value={formik.values.jobTitle}
            onBlur={formik.handleBlur}
            invalid={formik.touched.jobTitle && formik.errors.jobTitle}
            valid={formik.touched.jobTitle && !formik.errors.jobTitle}
          />
          <FormFeedback>{formik.errors.jobTitle}</FormFeedback>
        </Col>
      </Row>
    </FormGroup>
  )
}

export default JobTitle
