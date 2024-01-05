import { useState } from 'react';
import { InputGroup, FormGroup, Input, Label, Col, Row } from 'reactstrap';

export const PhoneInput = ({onPhoneNumberChange}) => {
  const [areaCode, setAreaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleAreaCodeChange = e => {
    setAreaCode(e.target.value);
    onPhoneNumberChange({ areaCode: e.target.value, phoneNumber });
  };

  const handlePhoneNumberChange = e => {
    setPhoneNumber(e.target.value);
    onPhoneNumberChange({areaCode, phoneNumber: e.target.value})
  };

  
  return (
    <FormGroup>
      <Label>Supplier Phone Number</Label>
    <InputGroup>
      <Row>
        {/* Area code */}
        <Col xs='auto' className="pr-1">            
              <Input
                type="select"
                value={areaCode}
                onChange={handleAreaCodeChange}
                style={{width: '70px'}}>
              <option value="1">+1</option>
            <option value="44">+44</option>
            {/* Add more area codes as needed */}
              </Input>            
        </Col>
        {/* phone number */}
        <Col className="pl-1">
          <Input
            type="text"
            placeholder="xxx-xx-xxxx"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
          />
        </Col>
      </Row>
      </InputGroup>
      </FormGroup>
  )
}
