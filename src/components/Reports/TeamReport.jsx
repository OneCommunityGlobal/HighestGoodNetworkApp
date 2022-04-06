import React, { Component } from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux';
import { getTeamDetail } from '../../actions/team';
import { Dropdown, DropdownButton } from 'react-bootstrap';

class TeamReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team: {},
      teamId: '',
      isLoading: false,
    };
  }

  async componentDidMount() {
    if (this.props.match) {
      this.props.getTeamDetail(this.props.match.params.teamId);
      this.setState({
        team: {
          ...this.props.team,
        },
        teamId: this.props.match.params.teamId,
        isLoading: false,
      });
    }
  }

  render() {
    const { team } = this.state;
    const { isActive, modifiedDatetime, _id, teamName, createdDatetime } = team;

    return (
      <div>
        teamProfile
        <DropdownButton id="dropdown-basic-button" title="Time Frame">
          <Dropdown.Item href="#/action-1">Past Week</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Past Two Weeks</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Past Month</Dropdown.Item>
          <Dropdown.Item href="#/action-4">Past 6 Months</Dropdown.Item>
          <Dropdown.Item href="#/action-5">Past Year</Dropdown.Item>
          <Dropdown.Item href="#/action-6">Custom range</Dropdown.Item>
        </DropdownButton>
        <h2>Team Name:{teamName}</h2>
        <h2>Team ID:{_id}</h2>
        <h5>Active:{String(isActive)}</h5>
        <h5>Modified Date time:{modifiedDatetime}</h5>
        <h5>Created Date time:{createdDatetime}</h5>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  team: state.team,
});

export default connect(mapStateToProps, {
  getTeamDetail,
})(TeamReport);
