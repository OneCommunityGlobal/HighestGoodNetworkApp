import { FormGroup, Input, Row, Col, Label} from 'reactstrap'

const GoogleDoc = props => {
    const { formik } = props
  
    return (
      <FormGroup>
        <Row>
          <Col>
            <Label htmlFor="googleDoc">Google Doc</Label>
          </Col>
          <Col>
            <Input
              name="googleDoc"
              id="googleDoc"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              valid={formik.touched.googleDoc && !formik.errors.googleDoc}
              invalid={formik.touched.googleDoc && formik.errors.googleDoc}
              placeholder="Admin Document"
            />
          </Col>
        </Row>
      </FormGroup>
    )
  }
  

export default GoogleDoc
