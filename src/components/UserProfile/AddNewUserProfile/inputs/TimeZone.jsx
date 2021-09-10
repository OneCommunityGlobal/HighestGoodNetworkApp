import TimeZoneDropDown from 'components/UserProfile/TimeZoneDropDown'

import { Row, Col, Input, Label, FormGroup } from 'reactstrap'

const TimeZone = props => {
  const { formik } = props

  return (
    <>
      <Row>
        <Col>
          <Label htmlFor="timeZone">Time Zone</Label>
        </Col>
        <Col>
          <FormGroup>
            <TimeZoneDropDown
              filter={formik.values.timeZoneFilter}
              onChange={formik.handleChange}
              selected={'America/Los_Angeles'}
              id="timeZone"
              name="timeZone"
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <Label>Search For Time Zone</Label>
        </Col>
        <Col>
          <FormGroup>
            <Input
              type="text"
              id="timeZoneFilter"
              name="timeZoneFilter"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              defaultValue={formik.initialValues.timeZoneFilter}
            />
          </FormGroup>
        </Col>
      </Row>
    </>
  )
}

export default TimeZone
