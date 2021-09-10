import { FormGroup, FormFeedback, Input, Row, Col, Label} from 'reactstrap'

const Name = props => {
    const { formik } = props
  
    return (
      <FormGroup>
        <Row>
          <Col>
            <Label htmlFor="firstName">Name</Label>
          </Col>
          <Col>
            <Row>
              <Col>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="First Name"
                  value={formik.values.firstName}
                  onBlur={formik.handleBlur}
                  invalid={formik.touched.firstName && formik.errors.firstName}
                  valid={formik.touched.firstName && !formik.errors.firstName}
                />
                <FormFeedback>{formik.errors.firstName}</FormFeedback>
              </Col>
              <Col>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Last Name"
                  value={formik.values.lastName}
                  onBlur={formik.handleBlur}
                  invalid={formik.touched.lastName && formik.errors.lastName}
                  valid={formik.touched.lastName && !formik.errors.lastName}
                />
                <FormFeedback>{formik.errors.lastName}</FormFeedback>
              </Col>
            </Row>
          </Col>
        </Row>
      </FormGroup>
    )
  }

export default Name
