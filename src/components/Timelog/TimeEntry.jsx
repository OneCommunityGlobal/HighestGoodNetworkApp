import React from 'react'
import {
    Card,
    Row,
    Col
} from 'reactstrap'
import moment from "moment";

const TimeEntry = ({data}, {displayYear}) => {
    const padZero = number => {
        return ("0" + number).slice(-2);
    };

    const date = moment(data.dateOfWork);

    return (
        <Card>
            <Row>
                <Col md={3}>
                    <div>
                        <h4>
                            {date.format('MMM D')}
                        </h4>
                        {displayYear &&                  
                            <h5>
                                {date.format('YYYY')}
                            </h5>
                        }
                        <h5>
                            {date.format('dddd')}
                        </h5>
                    </div>
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