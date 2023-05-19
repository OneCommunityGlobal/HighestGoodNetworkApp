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
import { getAllUserProfile } from 'actions/userManagement';
import { TEAM_MEMBER, SUMMARY_RECEIVER, SUMMARY_GROUP, ACTIONS, ACTIVE } from 'languages/en/ui';
import CreateNewSummaryGroupPopup from './CreateNewSummaryGroupPopup';
import UpdateSummaryGroupPopup from './UpdateSummaryGroupPopup';
import DeleteSummaryGroupPopup from './DeleteSummaryGroupPopup';
import SummaryTablesearchPanel from './SummaryTableSearchPanel';
import SummaryGroupStatusPopup from './SummaryGroupStatusPopup';
import SummarysOverview from './SummarysOverview';
import TeamMembersPopup from './TeamMembersPopup';
import SummaryReceiverPopup from './SummaryReceiverPopup';

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
      summaryGroupNameSearchText: '',
      isActive: '',
      summaryGroups: [],
      wildCardSearchText: '',
      members: [],
      summaryReceiver: [],
      SummaryReceiverPopupOpen: false,
    };
  }
  async componentDidMount() {
    this.props.getAllSummaryGroup();
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
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroup: '',
      createNewSummaryGroupPopupOpen: false,
    });
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
    this.props.updateSummaryGroup(
      updatename,
      this.state.selectedSummaryGroupId,
      this.state.isActive,
    );
    alert('Team update successfully');
    this.setState({
      updateSummaryGroupPopupOpen: false,
    });
  };
  onConfirmClick = (summaryGroupId, summaryGroupName, isActive) => {
    this.props.updateSummaryGroup(summaryGroupId, summaryGroupName, isActive);
    this.setState({
      summaryGroupStatusPopupOpen: false,
      deleteSummaryGroupPopupOpen: false,
    });
    alert('Status Updated Successfully');
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
      summaryGroupStatusPopupOpen: false,
    });
  };

  onTeamMembersPopupShow = async (summaryGroupId, name) => {
    this.setState({
      teamMembersPopupOpen: true,
      selectedSummaryGroup: name,
      selectedSummaryGroupId: summaryGroupId,
    });
    try {
      const response = await axios.get(ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS(summaryGroupId));
      const members = response.data;
      this.setState({ members: response.data });
    } catch (error) {
      console.log(error);
    }
  };

  getTeamMembers = async summaryGroupId => {
    try {
      const response = await axios.get(ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS(summaryGroupId));
      const members = response.data;
      this.setState({ members: response.data });
    } catch (error) {
      console.log(error);
    }
  };

  onTeamMembersPopupClose = () => {
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroup: '',
      teamMembersPopupOpen: false,
    });
  };
  onAddTeamMember = async (user, selectedSummaryGroupId) => {
    const requestData = {
      _id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
    };
    try {
      const response = await axios.post(
        ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS(selectedSummaryGroupId),
        requestData,
      );
    } catch (error) {
      console.log(error);
    }
    try {
      const response = await axios.get(
        ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS(selectedSummaryGroupId),
      );

      const members = response.data;
      this.setState({ members: response.data });
    } catch (error) {
      console.log(error);
    }
  };

  onDeleteTeamMember = async deletedUserId => {
    const requestData = {
      _id: deletedUserId,
    };

    try {
      const response = await axios.delete(
        ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS_DELETE(
          this.state.selectedSummaryGroupId,
          deletedUserId,
        ),
      );
    } catch (error) {
      console.log(error);
    }
    try {
      const response = await axios.get(
        ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS(this.state.selectedSummaryGroupId),
      );
      const members = response.data;
      this.setState({ members: response.data });
    } catch (error) {
      console.log(error);
    }

    alert(
      'Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are one drop, together we are an ocean.” Through the action you just took, this ocean is now one drop smaller.',
    );
  };

  onSummaryReciverShow = async (summaryGroupId, name) => {
    this.setState({
      SummaryReceiverPopupOpen: true,
      selectedSummaryGroup: name,
      selectedSummaryGroupId: summaryGroupId,
    });

    try {
      const response = await axios.get(ENDPOINTS.SUMMARY_GROUP_SUMMARY_RECEVIER(summaryGroupId));
      const summaryReceiver = response.data;
      this.setState({ summaryReceiver: response.data });
    } catch (error) {
      console.log(error);
    }
  };
  onSummaryReciverClose = () => {
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroup: '',
      SummaryReceiverPopupOpen: false,
    });
  };
  onAddSummaryReceiver = async (user, selectedSummaryGroupId) => {
    const requestData = {
      _id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      email: user.email,
    };
    try {
      const response = await axios.post(
        ENDPOINTS.SUMMARY_GROUP_SUMMARY_RECEVIER(selectedSummaryGroupId),
        requestData,
      );
    } catch (error) {
      console.log(error);
    }

    try {
      const response = await axios.get(
        ENDPOINTS.SUMMARY_GROUP_SUMMARY_RECEVIER(selectedSummaryGroupId),
      );
      const summaryReceiver = response.data;
      this.setState({ summaryReceiver: response.data });
    } catch (error) {
      console.log(error);
    }
  };

  onDeleteSummaryReceiver = async deletedUserId => {
    try {
      const response = await axios.delete(
        ENDPOINTS.SUMMARY_GROUP_SUMMARY_RECEIVER_DELETE(
          this.state.selectedSummaryGroupId,
          deletedUserId,
        ),
      );
    } catch (error) {
      console.log(error);
    }
    try {
      const response = await axios.get(
        ENDPOINTS.SUMMARY_GROUP_SUMMARY_RECEVIER(this.state.selectedSummaryGroupId),
      );
      const summaryReceiver = response.data;
      this.setState({ summaryReceiver: response.data });
    } catch (error) {
      console.log(error);
    }
    alert(
      'Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are one drop, together we are an ocean.” Through the action you just took, this ocean is now one drop smaller.',
    );
  };
  onWildCardSearch = searchText => {
    console.log('Search text:', searchText);
    this.setState(
      {
        wildCardSearchText: searchText,
      },
      () => {
        const filteredList = this.filteredTeamList(this.state.summaryGroups);
      },
    );
  };

  filteredTeamList = summaryGroups => {
    const filteredList = summaryGroups.filter(summaryGroup => {
      // Applying the search filters before creating each team table data element
      if (
        (summaryGroup.summaryGroupName &&
          summaryGroup.summaryGroupName
            .toLowerCase()
            .indexOf(this.state.summaryGroupNameSearchText.toLowerCase()) > -1 &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          summaryGroup.summaryGroupName
            .toLowerCase()
            .indexOf(this.state.wildCardSearchText.toLowerCase()) > -1)
      ) {
        return summaryGroup;
      }
      return false;
    });
    return filteredList;
  };

  render() {
    const { allSummaryGroups } = this.props.state.allSummaryGroups;
    const summaryGroupTable = this.summaryGroupElements(allSummaryGroups);
    const numberOfSummaryGroup = allSummaryGroups.length;
    const numberOfActiveSummaryGroup = numberOfSummaryGroup
      ? allSummaryGroups.filter(summaryGroup => summaryGroup.isActive).length
      : 0;
    const usersdata = this.props.state ? this.props.state.allUserProfiles : [];
    return (
      <React.Fragment>
        <div className="container">
          <SummarysOverview
            numberOfSummaryGroup={numberOfSummaryGroup}
            numberOfActiveSummaryGroup={numberOfActiveSummaryGroup}
          />
          <SummaryTablesearchPanel
            onSearch={this.onWildCardSearch}
            //requestorRole={requestorRole}
            //userPermissions={userPermissions}
            //roles={roles}
            onCreateNewTeamClick={this.onCreateNewTeamShow}
          />
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
          <TeamMembersPopup
            open={this.state.teamMembersPopupOpen}
            onClose={this.onTeamMembersPopupClose}
            members={this.state.members}
            usersdata={usersdata}
            selectedSummaryGroupName={this.state.selectedSummaryGroup}
            selectedSummaryGroupId={this.state.selectedSummaryGroupId}
            onAddUser={this.onAddTeamMember}
            onDeleteClick={this.onDeleteTeamMember}
          ></TeamMembersPopup>
          <SummaryReceiverPopup
            open={this.state.SummaryReceiverPopupOpen}
            onClose={this.onSummaryReciverClose}
            members={this.state.summaryReceiver}
            usersdata={usersdata}
            selectedSummaryGroupName={this.state.selectedSummaryGroup}
            selectedSummaryGroupId={this.state.selectedSummaryGroupId}
            onAddUser={this.onAddSummaryReceiver}
            onDeleteClick={this.onDeleteSummaryReceiver}
          ></SummaryReceiverPopup>

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
            <tbody>{summaryGroupTable}</tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }

  summaryGroupElements = allSummaryGroups => {
    if (allSummaryGroups && allSummaryGroups.length > 0) {
      const SummaryGroupSearchData = this.filteredTeamList(allSummaryGroups);
      /*
       * Builiding the table body for teams returns
       * the rows for currently selected page .
       * Applying the Default sort in the order of created date as well
       */
      return SummaryGroupSearchData.sort((a, b) => {
        if (a.createdDatetime > b.createdDatetime) return -1;
        if (a.createdDatetime < b.createdDatetime) return 1;
        return 0;
      }).map((summaryGroup, index) => (
        <SummaryGroupTableBody
          key={summaryGroup._id}
          index={index}
          name={summaryGroup.summaryGroupName}
          active={summaryGroup.isActive}
          summaryGroupId={summaryGroup._id}
          onStatusClick={this.onSummaryGroupStatusShow}
          onMembersClick={this.onTeamMembersPopupShow}
          onSummaryReciverClick={this.onSummaryReciverShow}
          onEditTeam={this.onUpdateTeamPopupShow}
          onDeleteClick={this.onDeleteTeamPopupShow}
        />
      ));
    }
  };
}

const mapStateToProps = state => ({ state });
export default connect(mapStateToProps, {
  postNewSummaryGroup,
  getAllSummaryGroup,
  deleteSummaryGroup,
  updateSummaryGroup,
})(SummaryManagement);
