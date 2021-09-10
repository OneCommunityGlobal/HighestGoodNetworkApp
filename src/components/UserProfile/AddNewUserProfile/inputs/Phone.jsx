import { FormGroup, Row, Col, Label} from 'reactstrap'
import PhoneInput from 'react-phone-input-2'
import ToggleSwitch from 'components/UserProfile/UserProfileEdit/ToggleSwitch'

const Phone = props => {
    const { formik } = props
  
    const isValid = formik.touched.phoneNumber && !formik.errors.phoneNumber
    const isInvalid = formik.touched.phoneNumber && formik.errors.phoneNumber
    let className = ''
    if (isValid) className = 'is-valid'
    if (isInvalid) className = 'is-invalid'
  
    return (
      <Row>
        <Col md="6">
          <Label>Phone</Label>
        </Col>
        <Col md="6">
          <FormGroup>
            <ToggleSwitch
              switchType="phone"
              state={formik.values.privacySettings.phoneNumber}
              setState={state => {
                formik.setValues({
                  ...formik.values,
                  privacySettings: {
                    ...formik.values.privacySettings,
                    phoneNumber: state,
                  },
                })
              }}
              onLabel="Public"
              offLabel="Private"
            />
            <PhoneInput
              country={'us'}
              onChange={(value, country, e, formattedValue) => {
                formik.handleChange(e)
              }}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNumber}
              inputProps={{
                id: 'phoneNumber',
                name: 'phoneNumber',
                className: `form-control ${className}`,
              }}
            />
            {formik.errors.phoneNumber && (
              <div style={{ color: '#dc3545', fontSize: '80%' }}>{formik.errors.phoneNumber}</div>
            )}
          </FormGroup>
        </Col>
      </Row>
    )
  }

export default Phone
