import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { getTeamDetail } from '../../../actions/team';
import { ReportHeader } from "../sharedComponents/ReportHeader";
import { ReportPage } from '../sharedComponents/ReportPage';
import { getTeamReportData } from './selectors';
import '../../Teams/Team.css';

export const TeamReport = ({ match }) => {

  const dispatch = useDispatch();
  const { team } = useSelector(getTeamReportData);

  useEffect(() => {
    if (match) {
      dispatch(getTeamDetail(match.params.teamId));
    }
  }, []);

  const { isActive, modifiedDatetime, _id, teamName, createdDatetime } = team;

  return (
    <ReportPage 
      renderProfile={
        () =>
        <ReportHeader isActive={isActive}>
          <h2>{teamName}</h2>
        </ReportHeader>
    }>
        <DropdownButton id="dropdown-basic-button" title="Time Frame">
        <Dropdown.Item href="#/action-1">Past Week</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Past Two Weeks</Dropdown.Item>
        <Dropdown.Item href="#/action-3">Past Month</Dropdown.Item>
        <Dropdown.Item href="#/action-4">Past 6 Months</Dropdown.Item>
        <Dropdown.Item href="#/action-5">Past Year</Dropdown.Item>
        <Dropdown.Item href="#/action-6">Custom range</Dropdown.Item>
      </DropdownButton>
      <h2>Team ID:{_id}</h2>
      <h5>Modified Date time:{modifiedDatetime}</h5>
      <h5>Created Date time:{createdDatetime}</h5>
    </ReportPage>
  );
}
