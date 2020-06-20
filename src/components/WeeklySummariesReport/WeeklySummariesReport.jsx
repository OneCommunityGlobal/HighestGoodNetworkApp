/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';
import './WeeklySummariesReport.css';
import classnames from 'classnames';
import moment from 'moment';
import 'moment-timezone';
import Loading from '../common/Loading';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import FormattedReport from './FormattedReport';
import GeneratePdfReport from './GeneratePdfReport';


const WeeklySummariesReport = () => {
  const getWeekDates = weekIndex => (
    {
      fromDate: moment().tz('America/Los_Angeles').startOf('week').subtract(weekIndex, 'week')
        .format('MMMM Do'),
      toDate: moment().tz('America/Los_Angeles').endOf('week').subtract(weekIndex, 'week')
        .format('MMMM Do, YYYY'),
    }
  );

  const dispatch = useDispatch();

  const { error, loading, summaries } = useSelector(state => state.weeklySummariesReport);

  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    dispatch(getWeeklySummariesReport());
  }, []);

  if (error) {
    return (
      <div>Error! {error.message}</div>
    );
  }

  if (loading) {
    return (
      <Container fluid>
        <Row className="text-center">
          <Loading />
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="bg--white-smoke py-3 mb-5">
      <h3 className="mt-3 mb-5">Weekly Summaries Reports page</h3>
      <Row>
        <Col lg={{ size: 10, offset: 1 }}>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '1' })}
                onClick={() => setActiveTab('1')}
              >
                This Week
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '2' })}
                onClick={() => setActiveTab('2')}
              >
                Last Week
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '3' })}
                onClick={() => setActiveTab('3')}
              >
                Week Before Last
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab} className="p-4">
            <TabPane tabId="1">
              <Row>
                <Col sm="12" md="8" className="mb-2">From <b>{getWeekDates(0).fromDate}</b> to <b>{getWeekDates(0).toDate}</b></Col>
                <Col sm="12" md="4"><GeneratePdfReport summaries={summaries} weekIndex="0" weekDates={getWeekDates(0)} /></Col>
              </Row>
              <Row>
                <Col>
                  <FormattedReport summaries={summaries} weekIndex="0" />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row>
                <Col sm="12" md="8" className="mb-2">From <b>{getWeekDates(1).fromDate}</b> to <b>{getWeekDates(1).toDate}</b></Col>
                <Col sm="12" md="4"><GeneratePdfReport summaries={summaries} weekIndex="1" weekDates={getWeekDates(1)} /></Col>
              </Row>
              <Row>
                <Col>
                  <FormattedReport summaries={summaries} weekIndex="1" />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="3">
              <Row>
                <Col sm="12" md="8" className="mb-2">From <b>{getWeekDates(2).fromDate}</b> to <b>{getWeekDates(2).toDate}</b></Col>
                <Col sm="12" md="4"><GeneratePdfReport summaries={summaries} weekIndex="2" weekDates={getWeekDates(2)} /></Col>
              </Row>
              <Row>
                <Col>
                  <FormattedReport summaries={summaries} weekIndex="2" />
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </Container>
  );
};

export default WeeklySummariesReport;
