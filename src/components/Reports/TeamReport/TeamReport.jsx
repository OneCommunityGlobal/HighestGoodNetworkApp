import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { FiUsers } from 'react-icons/fi';
import { getTeamDetail } from '../../../actions/team';
import { ReportPage } from '../sharedComponents/ReportPage';
import { getTeamReportData } from './selectors';
import './TeamReport.css';

export const TeamReport = ({ match }) => {

  const dispatch = useDispatch();
  const { team } = useSelector(getTeamReportData);

  useEffect(() => {
    if (match) {
      dispatch(getTeamDetail(match.params.teamId));
    }
  }, []);

  if (!team) {
    return null;
  }

  return (
    <ReportPage
      contentClassName='team-report-blocks'
      renderProfile={
        () =>
          <ReportPage.ReportHeader isActive={team.isActive} avatar={<FiUsers />} name={team.teamName}>
            <div>
              <h5>{moment(team.createdDatetime).format('YYYY-MM-DD')}</h5>
              <p>Created Date</p>
            </div>
          </ReportPage.ReportHeader>
      }>
      <ReportPage.ReportBlock className='team-report-main-info-wrapper'>
        <div className='team-report-main-info'>
          <div><span className='team-report-star'>&#9733;</span> Team ID: {team._id}</div>
          <div className='update-date'>Last updated: {moment(team.modifiedDatetime).format('YYYY-MM-DD')}</div>
        </div>
      </ReportPage.ReportBlock>

      <ReportPage.ReportBlock />
    </ReportPage>
  );
}
