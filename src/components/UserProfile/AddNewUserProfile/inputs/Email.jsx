import { FormGroup, Input, Row, Col, Label, FormFeedback} from 'reactstrap'
import ToggleSwitch from 'components/UserProfile/UserProfileEdit/ToggleSwitch'

const Email = props => {
    const { formik } = props
  
    return (
      <Row>
        <Col md="6">
          <Label htmlFor="email">Email</Label>
        </Col>
        <Col md="6">
          <FormGroup>
            <Input
              type="email"
              name="email"
              id="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Email"
              invalid={formik.touched.email && formik.errors.email}
              valid={formik.touched.email && !formik.errors.email}
            />
            <ToggleSwitch
              state={formik.values.privacySettings.email}
              setState={state => {
                formik.setValues({
                  ...formik.values,
                  privacySettings: {
                    ...formik.values.privacySettings,
                    email: state,
                  },
                })
              }}
              onLabel="Public"
              offLabel="Private"
            />
            <FormFeedback>{formik.errors.email}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
    )
  }

export default Email
