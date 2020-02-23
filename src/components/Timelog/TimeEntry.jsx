import React from 'react'
import {
    Card,
    Row,
    Col,
} from 'reactstrap'
import ReactHtmlParser from 'react-html-parser';
import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons'

import "./TimeEntry.css";

const TimeEntry = ({data}, {displayYear}) => {
    const padZero = number => {
        return ("0" + number).slice(-2);
    };

    const date = moment(data.dateOfWork);

    return (
        <Card className="mb-1 p-2">
            <Row className="mx-0">
                <Col md={3} className="date-block px-0">
                    <div className="date-div">
                    <div>
                        <h4>
                            {date.format('MMM D')}
                        </h4>
                        {displayYear &&                  
                            <h5>
                                {date.format('YYYY')}
                            </h5>
                        }
                        <h5 className="text-info">
                            {date.format('dddd')}
                        </h5>
                    </div>
                    </div>
                </Col>
                <Col md={4} className="px-0">
                    <h4 className="text-primary">
                        {data.hours}h {data.minutes}m
                    </h4>
                    <span className="text-muted">
                        Project:
                    </span> 
                    <h6> {data.projectName} </h6>
                    <span className="text-muted">Tangible: </span> {' '}                                
                    <input type="checkbox" name="isTangible" checked={data.isTangible} readOnly/>
                </Col>
                <Col md={5} className="pl-2 pr-0">
                    <span className="text-muted">
                        Notes:
                    </span>
                    {ReactHtmlParser(data.notes)}
                    <div className="buttons">
                        <FontAwesomeIcon icon={faEdit} size="lg" className="mr-3 text-primary"/>
                        <FontAwesomeIcon icon={faTrashAlt} size="lg" className="mr-3 text-primary"/>
                    </div>
                </Col>
            </Row>
        </Card>
    );
}

export default TimeEntry