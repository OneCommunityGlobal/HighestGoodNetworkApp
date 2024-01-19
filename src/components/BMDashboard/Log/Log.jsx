import { useState } from 'react';
import React, {Container, Form, Row, Col, Dropdown, DropdownMenu, DropdownItem, DropdownToggle, Input, Label} from 'reactstrap';
import "./Log.css";

function Log() {
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isCheckInOutDropdownOpen, setIsCheckInOutDropdownOpen] = useState(false);
    const logFormHeading = "Tool Equipment Daily Activities Log";

    const toggleProjectDowndown = () => {
        setIsProjectDropdownOpen((prevState) => setIsProjectDropdownOpen(!prevState));
    };

    const toggleCheckInOutDropdown = () => {
        setIsCheckInOutDropdownOpen((prevState) => setIsCheckInOutDropdownOpen(!prevState));
    };

    return (
        <div className='log-form-container'>
            <Form>
                <Row>
                    <Label>
                        {logFormHeading}
                    </Label>
                </Row>
                <Row>
                    <Row>
                        <Col>
                        <Label>Date: 
                        </Label>
                        </Col>
                            <Col>
                                <Input
                                id="exampleDate"
                                name="date"
                                placeholder="date placeholder"
                                type="date"
                                />
                            </Col>
                    </Row>
                    <Row>
                        <Col>Project: </Col>
                            <Col>
                                <Dropdown isOpen={isProjectDropdownOpen} toggle={toggleProjectDowndown}>
                                    <DropdownToggle caret>Project</DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem>Test 1</DropdownItem>
                                            <DropdownItem>Test 2</DropdownItem>
                                        </DropdownMenu>
                                </Dropdown>
                            </Col>
                    </Row>
                    <Row>
                        <Col>Check in or Out: </Col>
                        <Col>
                                <Dropdown isOpen={isCheckInOutDropdownOpen} toggle={toggleCheckInOutDropdown}>
                                    <DropdownToggle caret>Check out</DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem>Test 1</DropdownItem>
                                            <DropdownItem>Test 2</DropdownItem>
                                        </DropdownMenu>
                                </Dropdown>
                            </Col>
                    </Row>
                </Row>
                <Row>
                    <Col>
                        <Label>
                            Item
                        </Label>
                    </Col>
                    <Col>
                        <Label>
                            Quantity
                        </Label>
                    </Col>
                    <Col>
                        <Label>
                            Daily Log Input
                        </Label>
                    </Col>
                </Row>
                <Row>
                <Col>
                        <Label>
                            ID
                        </Label>
                    </Col>
                    <Col>
                        <Label>
                            Name
                        </Label>
                    </Col>
                    <Col>
                        <Label>
                            Working
                        </Label>
                    </Col>
                    <Col>
                        <Label>
                            Available
                        </Label>
                    </Col>
                    <Col>
                        <Label>
                            Using
                        </Label>
                    </Col>
                    <Col>
                        <Label>
                            Tool/Equipment Number
                        </Label>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

export default Log;
