import { FormGroup, FormFeedback, Input, Row, Col, Label} from 'reactstrap'

const WeeklyCommittedHours = props => {
    const { formik } = props
  
    return (
      <FormGroup>
        <Row>
          <Col>
            <Label htmlFor="weeklyCommittedHours">Weekly Committed Hours</Label>
          </Col>
          <Col>
            <Input
              type="number"
              name="weeklyCommittedHours"
              id="weeklyCommittedHours"
              value={formik.values.weeklyCommittedHours}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Weekly committed hours"
              invalid={formik.touched.weeklyCommittedHours && formik.errors.weeklyCommittedHours}
            />
            <FormFeedback>{formik.errors.weeklyCommittedHours}</FormFeedback>
          </Col>
        </Row>
      </FormGroup>
    )
  }

export default WeeklyCommittedHours
