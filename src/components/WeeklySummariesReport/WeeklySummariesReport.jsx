/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';
import './WeeklySummariesReport.css';
import classnames from 'classnames';
import Loading from '../common/Loading';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import FormattedReport from './FormattedReport';


const WeeklySummariesReport = () => {
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
                <Col>
                  <FormattedReport summaries={summaries} weekIndex="0" />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row>
                <Col>
                  <FormattedReport summaries={summaries} weekIndex="1" />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="3">
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
