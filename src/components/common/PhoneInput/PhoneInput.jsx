import { InputGroup, FormGroup, Input, Label, Col, Row } from 'reactstrap';
import './PhoneInput.css';

// eslint-disable-next-line import/prefer-default-export
export function PhoneInput({ areaCode, setAreaCode, phoneNumber, setPhoneNumber }) {
  return (
    <FormGroup className="phone-input-container">
      <Label>Supplier Phone Number</Label>
      <InputGroup className="phone-input-content">
        <Row>
          {/* Area code */}
          <Col xs='auto' className="pr-1">
            <Input
              type="select"
              value={areaCode}
              onChange={e => setAreaCode(e.target.value)}
              style={{ width: '70px' }}>
              <option value="1">+1</option>
              <option value="44">+44</option>
              {/* Add more area codes as needed */}
            </Input>
          </Col>
          {/* phone number */}
          <Col className="pl-1 pr-0">
            <Input
              type="text"
              placeholder="xxx-xx-xxxx"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </Col>
        </Row>
      </InputGroup>
    </FormGroup>
  )
}
