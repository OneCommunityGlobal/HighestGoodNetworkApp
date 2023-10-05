import axios from 'axios';
import { entries } from 'lodash';
import React, { Component, useEffect, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import HistoryTable from './HistoryTable';



class LostTimeHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entriesList: [],
    };

    this.loadLostTimeEntries = this.loadLostTimeEntries.bind(this);
  }

  loadLostTimeEntries = async (projectList, userList, teamList, fromDate, toDate) => {
    let url = ENDPOINTS.TIME_ENTRIES_LOST_PROJ_LIST;
    const projTimeEntries = await axios
      .post(url, { projects: projectList, fromDate, toDate })
      .then(res => {
        return res.data.map(entry => {
          return {
            entryType: entry.entryType,
            name: entry.projectName,
            date: entry.dateOfWork,
            hours: entry.hours,
            minutes: entry.minutes,
            isTangible: entry.isTangible,
          };
        });
      });

    url = ENDPOINTS.TIME_ENTRIES_LOST_USER_LIST;
    const personTimeEntries = await axios
      .post(url, { users: userList, fromDate, toDate })
      .then(res => {
        return res.data.map(entry => {
          return {
            entryType: entry.entryType,
            name: entry.firstName + ' ' + entry.lastName,
            hours: entry.hours,
            minutes: entry.minutes,
            isTangible: entry.isTangible,
            date: entry.dateOfWork,
          };
        });
      });

    url = ENDPOINTS.TIME_ENTRIES_LOST_TEAM_LIST;
    const teamTimeEntries = await axios
      .post(url, { teams: teamList, fromDate, toDate })
      .then(res => {
        return res.data.map(entry => {
          return {
            entryType: entry.entryType,
            name: entry.teamName,
            hours: entry.hours,
            minutes: entry.minutes,
            isTangible: entry.isTangible,
            date: entry.dateOfWork,
          };
        });
      });

    return [...projTimeEntries, ...personTimeEntries, ...teamTimeEntries];
  };

  render() {
    const isOpen = this.props.isOpen;
    const fromDate = this.props.startDate.toLocaleDateString('en-CA');
    const toDate = this.props.endDate.toLocaleDateString('en-CA');
  
    const userList = this.props.users.map(user => user._id);
    const projectList = this.props.projects.map(proj => proj._id);
    const teamList = this.props.teams.map(team => team._id);
    this.loadLostTimeEntries(projectList, userList, teamList, fromDate, toDate).then(res => {
      console.log("res", res);
      this.setState(() => ({
        entriesList: res,
      }));
      console.log(this.state.entriesList);
    });
    

    return (
        <div className="table-data-container mt-5">
          {isOpen && <HistoryTable entriesList={this.state.entriesList} />}
        </div>
    );
  }
}

export default LostTimeHistory;