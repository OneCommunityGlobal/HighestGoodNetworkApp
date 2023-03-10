/*****************************************************************
 * Component   : SUMMARY MANAGEMENT
 * Author      : YAN XU
 * Created on  : 03/21/2023
 *****************************************************************/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import SummaryGroupTableBody from './summaryGroupTableBody';
import {
  postNewSummaryGroup,
  getAllSummaryGroup,
  deleteSummaryGroup,
  updateSummaryGroup,
} from 'actions/allSummaryAction';
import { TEAM_MEMBER, SUMMARY_RECEIVER, SUMMARY_GROUP, ACTIONS, ACTIVE } from 'languages/en/ui';
import CreateNewSummaryGroupPopup from './CreateNewSummaryGroupPopup';
import UpdateSummaryGroupPopup from './UpdateSummaryGroupPopup';
import DeleteSummaryGroupPopup from './DeleteSummaryGroupPopup';
import SummaryTablesearchPanel from './SummaryTableSearchPanel';
import SummaryGroupStatusPopup from './SummaryGroupStatusPopup';
import SummarysOverview from './SummarysOverview';
//import TeamMembersPopup from './TeamMembersPopup';

class SummaryManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createNewSummaryGroupPopupOpen: false,
      deleteSummaryGroupPopupOpen: false,
      updateSummaryGroupPopupOpen: false,
      summaryGroupStatusPopupOpen: false,
      teamMembersPopupOpen: false,
      selectedSummaryGroupId: 0,
      selectedSummaryGroup: '',
      isActive: '',
      summaryGroups: [],
    };
  }
  async componentDidMount() {
    try {
      const response = await axios.get(ENDPOINTS.SUMMARY_GROUPS);
      const data = response.data;
      this.setState({
        summaryGroups: data,
      });
    } catch (error) {
      this.setState({
        error: error,
      });
    }
    //this.props.getAllSummaryGroup();
  }

  /*Create New SummaryGroup related function */
  onCreateNewTeamShow = () => {
    this.setState({
      createNewSummaryGroupPopupOpen: true,
    });
  };
  onCreateNewSummaryGroupClose = () => {
    this.setState({
      createNewSummaryGroupPopupOpen: false,
    });
  };

  addNewSummaryGroup = name => {
    this.props.postNewSummaryGroup(name, true);
    alert('Team added successfully');
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroup: '',
      createNewSummaryGroupPopupOpen: false,
    });
    this.fetchSummaryGroup();
    //this.props.getAllSummaryGroup();
  };

  async fetchSummaryGroup() {
    const data = await axios.get(ENDPOINTS.SUMMARY_GROUPS).then(res => res.data);
    this.setState({
      ...this.state,
      summaryGroups: data,
    });
  }
  /*Delete SummaryGroup related function*/
  onDeleteTeamPopupShow = (deletedname, SummaryGroupId, status) => {
    this.setState({
      deleteSummaryGroupPopupOpen: true,
      selectedSummaryGroup: deletedname,
      selectedSummaryGroupId: SummaryGroupId,
      isActive: status,
    });
  };

  onDeleteTeamPopupClose = () => {
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroup: '',
      deleteSummaryGroupPopupOpen: false,
    });
  };

  onDeleteSummaryGroup = async deletedId => {
    this.props.deleteSummaryGroup(deletedId);

    alert('Team deleted successfully');
    this.setState({
      deleteSummaryGroupPopupOpen: false,
    });
    this.fetchSummaryGroup();
  };

  /*Update SummaryGroup related Function*/
  onUpdateTeamPopupShow = (updatename, SummaryGroupId, status) => {
    this.setState({
      updateSummaryGroupPopupOpen: true,
      selectedSummaryGroup: updatename,
      selectedSummaryGroupId: SummaryGroupId,
      isActive: status,
    });
  };
  onUpdateSummaryPopupClose = () => {
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroup: '',
      updateSummaryGroupPopupOpen: false,
    });
  };
  onUpadteSummaryGroup = async updatename => {
    updateSummaryGroup(updatename, this.state.selectedSummaryGroupId, this.state.isActive);
    alert('Team update successfully');
    this.setState({
      updateSummaryGroupPopupOpen: false,
    });
    this.fetchSummaryGroup();
  };
  onConfirmClick = (summaryGroupId, summaryGroupName, isActive) => {
    updateSummaryGroup(summaryGroupId, summaryGroupName, isActive);
    this.setState({
      summaryGroupStatusPopupOpen: false,
      deleteSummaryGroupPopupOpen: false,
    });
    alert('Status Updated Successfully');
    this.fetchSummaryGroup();
  };
  /* Active and Inactive Set function*/
  onSummaryGroupStatusShow = (summaryGroupName, summaryGroupId, isActive) => {
    this.setState({
      summaryGroupStatusPopupOpen: true,
      selectedSummaryGroup: summaryGroupName,
      selectedSummaryGroupId: summaryGroupId,
      isActive,
    });
  };
  onSummaryGroupStatusClose = () => {
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroupName: '',
      //isEdit: false,
      summaryGroupStatusPopupOpen: false,
    });
  };
  /*
  onTeamMembersPopupShow = (teamId, teamName) => {
    //this.props.getTeamMembers(teamId);
    this.setState({
      teamMembersPopupOpen: true,
      selectedSummaryGroup: teamName,
      selectedSummaryGroupId: teamId,
    });
  };

  onTeamMembersPopupClose = () => {
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroup: '',
      teamMembersPopupOpen: false,
    });
  };
  onDeleteTeamMember = deletedUserId => {
   // this.props.deleteTeamMember(this.state.selectedTeamId, deletedUserId);
    alert(
      'Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are one drop, together we are an ocean.” Through the action you just took, this ocean is now one drop smaller.',
    );
  };
  <TeamMembersPopup
            open={this.state.teamMembersPopupOpen}
            onClose={this.onTeamMembersPopupClose}
            members={members}
            onDeleteClick={this.onDeleteTeamMember}
           // usersdata={this.props.state ? this.props.state.allUserProfiles : []}
            //onAddUser={this.onAddUser}
           selectedSummaryGroupName={this.state.selectedSummaryGroup}
            //requestorRole={requestorRole}
           // roles={roles}
            //userPermissions={userPermissions}
            ></TeamMembersPopup>
            
  */

  render() {
    const { summaryGroups } = this.state;
    const numberOfSummaryGroup = summaryGroups.length;
    const numberOfActiveSummaryGroup = numberOfSummaryGroup
      ? summaryGroups.filter(summaryGroup => summaryGroup.isActive).length
      : 0;
    //const members = this.props.state ? this.props.state.teamsTeamMembers : [];
    return (
      <React.Fragment>
        <div className="container">
          <SummarysOverview
            numberOfSummaryGroup={numberOfSummaryGroup}
            numberOfActiveSummaryGroup={numberOfActiveSummaryGroup}
          />
          <SummaryTablesearchPanel onCreateNewTeamClick={this.onCreateNewTeamShow} />
          <CreateNewSummaryGroupPopup
            open={this.state.createNewSummaryGroupPopupOpen}
            onOkClick={this.addNewSummaryGroup}
            onClose={this.onCreateNewSummaryGroupClose}
            SummaryGroupName={this.state.selectedSummaryGroup}
            SummaryGroupId={this.state.selectedSummaryGroupId}
            isEdit={this.state.isEdit}
          />
          <UpdateSummaryGroupPopup
            open={this.state.updateSummaryGroupPopupOpen}
            onOkClick={this.onUpadteSummaryGroup}
            onClose={this.onUpdateSummaryPopupClose}
            SummaryGroupName={this.state.selectedSummaryGroup}
            SummaryGroupId={this.state.selectedSummaryGroupId}
            //isEdit={this.state.isEdit}
          />
          <DeleteSummaryGroupPopup
            open={this.state.deleteSummaryGroupPopupOpen}
            onClose={this.onDeleteTeamPopupClose}
            selectedSummaryGroupName={this.state.selectedSummaryGroup}
            selectedSummaryGroupId={this.state.selectedSummaryGroupId}
            selectedStatus={this.state.isActive}
            onDeleteClick={this.onDeleteSummaryGroup}
            onSetInactiveClick={this.onConfirmClick}
          />
          <SummaryGroupStatusPopup
            open={this.state.summaryGroupStatusPopupOpen}
            onClose={this.onSummaryGroupStatusClose}
            selectedSummaryGroupName={this.state.selectedSummaryGroup}
            selectedSummaryGroupId={this.state.selectedSummaryGroupId}
            selectedStatus={this.state.isActive}
            onConfirmClick={this.onConfirmClick}
          ></SummaryGroupStatusPopup>

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
              {this.state.summaryGroups &&
                this.state.summaryGroups.map((summaryGroup, index) => (
                  <SummaryGroupTableBody
                    key={summaryGroup._id}
                    index={index}
                    name={summaryGroup.summaryGroupName}
                    active={summaryGroup.isActive}
                    summaryGroupId={summaryGroup._id}
                    //requestorRole={props.requestorRole}
                    onStatusClick={this.onSummaryGroupStatusShow}
                    onMembersClick={this.onTeamMembersPopupShow}
                    //onMembersClick={this.onMembersClick}
                    onEditTeam={this.onUpdateTeamPopupShow}
                    onDeleteClick={this.onDeleteTeamPopupShow}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

// connect the component to the Redux store
//export default connect(mapStateToProps)(SummaryPage);

const mapStateToProps = state => ({ state });
export default connect(mapStateToProps, {
  postNewSummaryGroup,
  getAllSummaryGroup,
  deleteSummaryGroup,
  updateSummaryGroup,
})(SummaryManagement);
