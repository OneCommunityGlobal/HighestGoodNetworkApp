import React from 'react'
import {
    Card,
    Row,
    Col
} from 'reactstrap'
import moment from "moment";

const TimeEntry = ({data}) => {
    const padZero = number => {
        return ("0" + number).slice(-2);
    };

    return (
        <Card>
            <Row>
                <Col md={3}>
                    Date: {data.dateOfWork}
                </Col>
                <Col md={5}>
                    Time: {padZero(data.hours)}:{padZero(data.minutes)}
                    <br/>
                    Project: {data.projectName} <br/>
                    Tangible: {' '}                                
                    <input type="checkbox" name="isTangible" checked={data.isTangible} readOnly/>
                </Col>
                <Col md={4}>
                    Notes:<br/>
                    {data.notes}
                </Col>
            </Row>
        </Card>
    );
}

export default TimeEntry