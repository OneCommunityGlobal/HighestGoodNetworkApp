import React, { Component } from 'react';
import { TEAM_MEMBER, SUMMARY_RECEIVER, SUMMARY_GROUP, ACTIONS, ACTIVE } from 'languages/en/ui';
import SummaryTablesearchPanel from './SummaryTableSearchPanel';
import SummarysOverview from './SummarysOverview';

class SummaryManagement extends Component {
  data = [
    {
      summaryGroupId: 1,
      name: 'Summary Group 1',
      active: (
        <div className="isActive">
          <i className="fa fa-circle" aria-hidden="true" />
        </div>
      ),
      teamMember: (
        <button type="button" className="btn btn-outline-info">
          {TEAM_MEMBER}
        </button>
      ),
      summaryReceiver: (
        <button type="button" className="btn btn-outline-info">
          {SUMMARY_RECEIVER}
        </button>
      ),
    },
    {
      summaryGroupId: 2,
      name: 'Summary Group 2',
      active: (
        <div className="isNotActive">
          <i className="fa fa-circle-o" aria-hidden="true" />
        </div>
      ),
      teamMember: (
        <button type="button" className="btn btn-outline-info">
          {TEAM_MEMBER}
        </button>
      ),
      summaryReceiver: (
        <button type="button" className="btn btn-outline-info">
          {SUMMARY_RECEIVER}
        </button>
      ),
    },
  ];

  render() {
    return (
      <React.Fragment>
        <div className="container">
          <SummarysOverview />
          <SummaryTablesearchPanel />
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <tr>
                <th scope="col" id="summary__order">
                  {' '}
                  #
                </th>
                <th scope="col" id="summary_name">
                  {SUMMARY_GROUP}
                </th>
                <th scope="col" id="summary__active">
                  {ACTIVE}
                </th>
                <th scope="col" id="summary_team__member">
                  {TEAM_MEMBER}
                </th>
                <th scope="col" id="summary_receiver">
                  {SUMMARY_RECEIVER}
                </th>
                <th scope="col" id="summary_actions">
                  {ACTIONS}
                </th>
              </tr>
            </thead>
            <tbody>
              {this.data.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.active}</td>
                  <td>{row.teamMember}</td>
                  <td>{row.summaryReceiver}</td>
                  <td>
                    <div className="btn-group">
                      <button type="button" className="btn btn-outline-secondary">
                        <i className="fa fa-pencil" aria-hidden="true" />
                      </button>
                      <button type="button" className="btn btn-outline-secondary">
                        <i className="fa fa-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

export default SummaryManagement;
