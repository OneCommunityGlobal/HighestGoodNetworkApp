import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { Row, Col } from 'reactstrap';
import AddTeamPopup from './AddTeamPopup';
import UserTeamsTable from './UserTeamsTable';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSummaryGroup } from '../../../actions/allSummaryAction';
import { ENDPOINTS } from 'utils/URL';

const TeamsTab = props => {
  const { teamsData, userTeams, onDeleteteam, onAssignTeam, edit, role, userId, fullName } = props;
  const dispatch = useDispatch();
  const teamsData2 = useSelector(state => state.allSummaryGroups);
  const [addTeamPopupOpen, setaddTeamPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);
  const [summaryGroups, setSummaryGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [apiCallDone, setApiCallDone] = useState(true);
  const [apiDeletionDone, setApiDeletion] = useState(true);

  const onAddTeamPopupShow = () => {
    setaddTeamPopupOpen(true);
  };

  const onAddTeamPopupClose = () => {
    setaddTeamPopupOpen(false);
  };
  const onSelectDeleteTeam = teamId => {
    onDeleteteam(teamId);
  };

  const onSelectAssignTeam = team => {
    onAddTeamMember(team._id);
  };

  const filterGroups = (userId, allSummaryGroups) => {
    const filteredList = allSummaryGroups.filter(group =>
      group.teamMembers.some(member => member._id === userId),
    );
    return filteredList;
  };

  const fetchData = async () => {
    try {
      setSummaryGroups(teamsData2.allSummaryGroups);
    } catch (error) {
      console.log('Error occurred', error);
    }
  };

  useEffect(() => {
    fetchData();
    dispatch(getAllSummaryGroup());
  }, []);

  useEffect(() => {
    if (summaryGroups.length !== 0) {
      const filteredGroupsInfo = filterGroups(userId, summaryGroups);
      setFilteredGroups(filteredGroupsInfo);
    }
  }, [summaryGroups]);

  useEffect(() => {
    if (apiDeletionDone) {
      dispatch(getAllSummaryGroup());
    }
  }, [apiDeletionDone]);

  const onAddTeamMember = async selectedSummaryGroupId => {
    setApiCallDone(true);
    const requestData = {
      _id: userId,
      fullName,
      role: role,
    };
    //Updating state directly
    const updatedSummaryGroups = summaryGroups.map(summaryGroup => {
      if (summaryGroup._id === selectedSummaryGroupId) {
        return {
          ...summaryGroup,
          teamMembers: [...summaryGroup.teamMembers, requestData],
        };
      }
      return summaryGroup;
    });

    setSummaryGroups(updatedSummaryGroups);

    //Updating MongoDB
    try {
      const response = await axios.post(
        ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS(selectedSummaryGroupId),
        requestData,
      );

      // Updating Redux from MongoDB lazily
      dispatch(getAllSummaryGroup());
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => {
      setApiCallDone(true);
    }, 500);
  };

  const onDeleteTeamMembers = async selectedSummaryGroupId => {
    const requestData = {
      _id: userId,
    };
    setApiDeletion(false);
    try {
      const response = await axios.delete(
        ENDPOINTS.SUMMARY_GROUP_TEAM_MEMBERS_DELETE(selectedSummaryGroupId, userId),
      );
      const updatedSummaryGroups = summaryGroups.filter(
        group => group._id !== selectedSummaryGroupId,
      );
      setSummaryGroups(updatedSummaryGroups);
      setApiDeletion(true);
      alert('Summary Team successfully deleted!');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <React.Fragment>
      {/* <AddTeamPopup
        open={addTeamPopupOpen}
        onClose={onAddTeamPopupClose}
        teamsData={summaryGroups}
        userTeamsById={filteredGroups}
        onSelectAssignTeam={onSelectAssignTeam}
        apiCallDone={apiCallDone}
      /> */}
      <UserTeamsTable
        userTeamsById={filteredGroups}
        onButtonClick={onAddTeamPopupShow}
        onDeleteClick={onDeleteTeamMembers}
        renderedOn={renderedOn}
        edit={edit}
        role={role}
      />
    </React.Fragment>
  );
};
export default TeamsTab;
