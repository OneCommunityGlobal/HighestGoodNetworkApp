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
  extractMembers,
  extractSummaryReceivers,
  getUser,
} from 'actions/allSummaryAction';
// import { getUser } from 'actions/authActions';
import { getWeeklySummaries, extractWeeklySummaries } from 'actions/weeklySummaries';
import { getWeeklySummariesReport } from 'actions/weeklySummariesReport';
//import { getAllUserProfile } from 'actions/userManagement';
import { TEAM_MEMBER, SUMMARY_RECEIVER, SUMMARY_GROUP, ACTIONS, ACTIVE } from 'languages/en/ui';
import CreateNewSummaryGroupPopup from './CreateNewSummaryGroupPopup';
import UpdateSummaryGroupPopup from './UpdateSummaryGroupPopup';
import DeleteSummaryGroupPopup from './DeleteSummaryGroupPopup';
import SummaryTablesearchPanel from './SummaryTableSearchPanel';
import SummaryGroupStatusPopup from './SummaryGroupStatusPopup';
import SummarysOverview from './SummarysOverview';
import TeamMembersPopup from './TeamMembersPopup';
import SummaryReceiverPopup from './SummaryReceiverPopup';
import SummaryReportsDisplay from './SummaryReportsDisplay';

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
      ApiCallDone: true,
      displaySummaryReportTable: false,
      currentUserRole: '',
      currentUserId: 0,
    };
  }
  async componentDidMount() {
    this.props.getAllSummaryGroup();
    await this.props.getWeeklySummariesReport();
    // await this.props.getWeeklySummaries(this.state.selectedSummaryGroupId);
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

  getTeamMembersReports = async () => {
    try {
      //Getting the ids of every member in the summary group
      const result = await this.props.extractMembers(this.state.selectedSummaryGroupId);
      const members = { teamMembers: result.teamMembers };

      const reportsList = members.teamMembers.map(member => ({
        _id: member._id,
        fullName: member.fullName,
        report: '',
      }));

      // const errorList: {error: "Cannot pull records at the moment"}

      const extractedIds = reportsList.map(member => member._id);

      //Getting the 1st week summary reports of each member
      //remember to run the first and second line of code when the page loads up and not all times.
      // await this.props.getWeeklySummariesReport();
      // const summary = await this.props.getWeeklySummaries('this.state.selectedSummaryGroupId');

      const summaries = await this.props.extractWeeklySummaries(extractedIds);
      if (summaries) {
        const finalReportsList = reportsList.map(member => ({
          ...member,
          report: summaries.finallist.find(summary => summary._id === member._id)?.report || '',
        }));
        // console.log(finalReportsList);
        return finalReportsList;
      }
      return 'errorMessage';
    } catch (error) {
      console.log(error);
    }
  };

  onClickViewReports = groupId => {
    this.setState({
      selectedSummaryGroupId: groupId,
    });
  };
  onTeamMembersPopupShow = async (summaryGroupId, name) => {
    this.setState({
      teamMembersPopupOpen: true,
      selectedSummaryGroup: name,
      selectedSummaryGroupId: summaryGroupId,
    });

    try {
      //Calling the members from Redux
      const result = await this.props.extractMembers(summaryGroupId);
      const members = { teamMembers: result.teamMembers };
      //Calling the members from MongoDB
      // const response = await axios.get(ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS(summaryGroupId));
      // const members = response.data;

      // this.setState({ members: response.data });
      this.setState({ members: members });
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
  getTeamMembers = async selectedSummaryGroupId => {
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
  onAddTeamMember = async (user, selectedSummaryGroupId) => {
    this.setState({ ApiCallDone: false });
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
      //updating the member state variable directly with entired value
      const { members } = this.state;
      const newTeamList = [...members.teamMembers, requestData];
      this.setState({ members: { ...members, teamMembers: newTeamList } });
      //Updating Redux from MongoDB lazily
      this.props.getAllSummaryGroup();
      // this.getTeamMembers(selectedSummaryGroupId);
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => {
      this.setState({ ApiCallDone: true });
    }, 500);
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
    this.props.getAllSummaryGroup();
    this.getTeamMembers(this.state.selectedSummaryGroupId);

    alert(
      'Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are one drop, together we are an ocean.” Through the action you just took, this ocean is now one drop smaller.',
    );
  };
  getSummaryReceiver = async summaryGroupId => {
    try {
      const response = await axios.get(ENDPOINTS.SUMMARY_GROUP_SUMMARY_RECEVIER(summaryGroupId));
      const summaryReceiver = response.data;
      this.setState({ summaryReceiver: response.data });
      this.props.getAllSummaryGroup();
    } catch (error) {
      console.log(error);
    }
  };

  getSummaryReceiverRedux = async summaryGroupId => {
    try {
      if (summaryGroupId) {
        // console.log('Summary group works');
        const result = await this.props.extractSummaryReceivers(summaryGroupId);
        const receivers = { summaryReceivers: result };
        this.setState({ summaryReceiver: receivers });
        // console.log('result in destination: ', this.summaryReceiver);
        const user = await this.props.getUser();
        this.setState({ currentUserRole: user.role });
        this.setState({ currentUserId: user.userid });
        // await this.props.getWeeklySummaries(user.userid);
      }
    } catch (error) {
      console.log(error);
    }
  };

  fetchSummaryReceiver = async summaryGroupId => {
    try {
      if (summaryGroupId) {
        const result = await this.props.extractSummaryReceivers(summaryGroupId);
        const receivers = { summaryReceivers: result };
        return receivers;
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  };

  onDisplaySummaryTable = value => {
    if (value === 'true') {
      this.setState({ displaySummaryReportTable: true });
    }
    if (value === 'false') {
      this.setState({ displaySummaryReportTable: false });
    }
  };

  onSummaryReciverShow = async (summaryGroupId, name) => {
    this.setState({
      SummaryReceiverPopupOpen: true,
      selectedSummaryGroup: name,
      selectedSummaryGroupId: summaryGroupId,
    });
    this.getSummaryReceiverRedux(summaryGroupId);
  };
  onSummaryReciverClose = () => {
    this.setState({
      selectedSummaryGroupId: undefined,
      selectedSummaryGroup: '',
      SummaryReceiverPopupOpen: false,
    });
  };
  onAddSummaryReceiver = async (user, selectedSummaryGroupId) => {
    this.setState({ ApiCallDone: false });
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
    setTimeout(() => {
      this.setState({ ApiCallDone: true });
    }, 500);

    this.getSummaryReceiver(selectedSummaryGroupId);
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
    this.getSummaryReceiver(this.state.selectedSummaryGroupId);

    alert(
      'Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are one drop, together we are an ocean.” Through the action you just took, this ocean is now one drop smaller.',
    );
  };
  onWildCardSearch = searchText => {
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
    // console.log(allSummaryGroups[0]);
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
            summaryGroup={allSummaryGroups}
          />
          <UpdateSummaryGroupPopup
            open={this.state.updateSummaryGroupPopupOpen}
            onOkClick={this.onUpadteSummaryGroup}
            onClose={this.onUpdateSummaryPopupClose}
            SummaryGroupName={this.state.selectedSummaryGroup}
            SummaryGroupId={this.state.selectedSummaryGroupId}
            summaryGroup={allSummaryGroups}
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
            apiCallDone={this.state.ApiCallDone}
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
            apiCallDone={this.state.ApiCallDone}
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
          <div>
            <SummaryReportsDisplay
              teamMembersReports={this.getTeamMembersReports}
              summaryGroupId={this.state.selectedSummaryGroupId}
              getSummaryReceiver={this.getSummaryReceiverRedux}
              onDisplaySummaryTableVar={this.state.displaySummaryReportTable}
              onDisplaySummaryTableFunc={this.onDisplaySummaryTable}
              usersdata={usersdata}
              summaryReceiver={this.state.summaryReceiver}
              currentUserRole={this.state.currentUserRole}
              currentUserId={this.state.currentUserId}
              updateUserInfo={this.getSummaryReceiverRedux}
            />
          </div>
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
          onClickViewReports={this.onClickViewReports}
          onDisplaySummaryTable={this.onDisplaySummaryTable}
          currentUserRole={this.state.currentUserRole}
          currentUserId={this.state.currentUserId}
          updateUserInfo={this.getSummaryReceiverRedux}
          summaryReceiver={this.state.summaryReceiver}
          fetchSummaryReceiver={this.fetchSummaryReceiver}
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
  extractMembers,
  extractSummaryReceivers,
  getWeeklySummaries,
  extractWeeklySummaries,
  getWeeklySummariesReport,
  getUser,
})(SummaryManagement);
