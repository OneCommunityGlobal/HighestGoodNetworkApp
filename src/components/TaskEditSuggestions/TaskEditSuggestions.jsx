import React, { useEffect, useState } from 'react';
import { Container, Table } from 'reactstrap';
import { TaskEditSuggestionRow } from './Components/TaskEditSuggestionRow';
import { TaskEditSuggestionsModal } from './Components/TaskEditSuggestionsModal';

const taskEditSuggestionsInitial = [
  {
    _id: 1,
    user: "EK Example",
    dateSuggested: "2022-07-12T16:25:26.837Z",
    newTask: {
			_id:"62c9b82d11575257acb95f5f",
			taskId:"62a382a44ee5b0299c5ff212",
			userId:"627985bfe2896b87a47b99aa",
			__v:0,
			dateCreated:"2022-07-09T16:25:26.837Z",
			isAcknowleged:0,
			priority:"Primary",
			isAssigned:true,
			status:"Started",
			hoursBest:0,
			hoursWorst:0,
			hoursMost:0,
			estimatedHours:0,
			links:null,
      resources: [
        {
          _id:"62a382a44ee5b0299c5ff213",
          userID:"627985bfe2896b87a47b99aa",
          name:"EK Volunteer",
        }
      ],
			taskName:"EK Example Task 1",
			startedDatetime:null,
			dueDatetime:null,
			whyInfo:"",
			intentInfo:"",
			endstateInfo:"",
			classification:"",
    },
    oldTask: {
      _id:"62a382a44ee5b0299c5ff212",
      priority:"Primary",
      isAssigned:true,
      status:"Started",
      hoursBest:0,
      hoursWorst:0,
      hoursMost:0,
      estimatedHours:0,
      links:null,
      parentId1:null,
      parentId2:null,
      parentId3:null,
      mother:null,
      isActive:true,
      hasChild:false,
      modifiedDatetime:"2022-07-09T17:17:33.649Z",
      resources: [
        {
          _id:"62a382a44ee5b0299c5ff213",
          userID:"627985bfe2896b87a47b99aa",
          name:"EK Volunteer",
        },
        {
          _id:"62c9b82d11575257acb95f5c",
          userID:"62798679e2896b87a47b99bd",
          name:"EK Admin",
        },
      ],
      wbsId:"62799b53f8ff455aec1737a9",
      taskName:"Red Bell Test 13",
      num:"25",
      level:1,
      startedDatetime:null,
      dueDatetime:null,
      position:24,
      createdDatetime:"2022-06-10T17:43:00.009Z",
      whyInfo:"",
      intentInfo:"",
      endstateInfo:"",
      classification:"",
    }
  },
  {
    _id: 2,
    user: "EK Example",
    dateSuggested: "2022-07-11T16:25:26.837Z",
    newTask: {
			_id:"62c9b82d11575257acb95f5f",
			taskId:"62a382a44ee5b0299c5ff212",
			userId:"627985bfe2896b87a47b99aa",
			__v:0,
			dateCreated:"2022-07-09T16:25:26.837Z",
			isAcknowleged:0,
			priority:"Primary",
			isAssigned:true,
			status:"Started",
			hoursBest:0,
			hoursWorst:0,
			hoursMost:0,
			estimatedHours:0,
			links:null,
      resources: [
        {
          _id:"62a382a44ee5b0299c5ff213",
          userID:"627985bfe2896b87a47b99aa",
          name:"EK Volunteer",
        }
      ],
			taskName:"EK Example Task 2",
			startedDatetime:null,
			dueDatetime:null,
			whyInfo:"",
			intentInfo:"",
			endstateInfo:"",
			classification:"",
    },
    oldTask: {
      _id:"62a382a44ee5b0299c5ff212",
      priority:"Primary",
      isAssigned:true,
      status:"Started",
      hoursBest:0,
      hoursWorst:0,
      hoursMost:0,
      estimatedHours:0,
      links:null,
      parentId1:null,
      parentId2:null,
      parentId3:null,
      mother:null,
      isActive:true,
      hasChild:false,
      modifiedDatetime:"2022-07-09T17:17:33.649Z",
      resources: [
        {
          _id:"62a382a44ee5b0299c5ff213",
          userID:"627985bfe2896b87a47b99aa",
          name:"EK Volunteer",
        },
        {
          _id:"62c9b82d11575257acb95f5c",
          userID:"62798679e2896b87a47b99bd",
          name:"EK Admin",
        },
      ],
      wbsId:"62799b53f8ff455aec1737a9",
      taskName:"Red Bell Test 13",
      num:"25",
      level:1,
      startedDatetime:null,
      dueDatetime:null,
      position:24,
      createdDatetime:"2022-06-10T17:43:00.009Z",
      whyInfo:"",
      intentInfo:"",
      endstateInfo:"",
      classification:"",
    }
  },
  {
    _id: 3,
    user: "AAA",
    dateSuggested: "2022-07-10T16:25:26.837Z",
    newTask: {
			_id:"62c9b82d11575257acb95f5f",
			taskId:"62a382a44ee5b0299c5ff212",
			userId:"627985bfe2896b87a47b99aa",
			__v:0,
			dateCreated:"2022-07-09T16:25:26.837Z",
			isAcknowleged:0,
			priority:"Primary",
			isAssigned:true,
			status:"Started",
			hoursBest:0,
			hoursWorst:0,
			hoursMost:0,
			estimatedHours:0,
			links:null,
      resources: [
        {
          _id:"62a382a44ee5b0299c5ff213",
          userID:"627985bfe2896b87a47b99aa",
          name:"EK Volunteer",
        }
      ],
			taskName:"AAA Task 1",
			startedDatetime:null,
			dueDatetime:null,
			whyInfo:"",
			intentInfo:"",
			endstateInfo:"",
			classification:"",
    },
    oldTask: {
      _id:"62a382a44ee5b0299c5ff212",
      priority:"Primary",
      isAssigned:true,
      status:"Started",
      hoursBest:0,
      hoursWorst:0,
      hoursMost:0,
      estimatedHours:0,
      links:null,
      parentId1:null,
      parentId2:null,
      parentId3:null,
      mother:null,
      isActive:true,
      hasChild:false,
      modifiedDatetime:"2022-07-09T17:17:33.649Z",
      resources: [
        {
          _id:"62a382a44ee5b0299c5ff213",
          userID:"627985bfe2896b87a47b99aa",
          name:"EK Volunteer",
        },
        {
          _id:"62c9b82d11575257acb95f5c",
          userID:"62798679e2896b87a47b99bd",
          name:"EK Admin",
        },
      ],
      wbsId:"62799b53f8ff455aec1737a9",
      taskName:"Red Bell Test 13",
      num:"25",
      level:1,
      startedDatetime:null,
      dueDatetime:null,
      position:24,
      createdDatetime:"2022-06-10T17:43:00.009Z",
      whyInfo:"",
      intentInfo:"",
      endstateInfo:"",
      classification:"",
    }
  },
];

export const TaskEditSuggestions = () => {

  const[taskEditSuggestions, setTaskEditSuggestions] = useState([]);
  const [isTaskEditSuggestionModalOpen, setIsTaskEditSuggestionModalOpen] = useState(false);
  const [currentTaskEditSuggestion, setCurrentTaskEditSuggestion] = useState();
  
  const [userSortDirection, setUserSortDirection] = useState();
  const [dateSuggestedSortDirection, setDateSuggestedSortDirection] = useState("desc");

  useEffect(() => setTaskEditSuggestions(taskEditSuggestionsInitial.sort((tes1, tes2) => tes2.dateSuggested.localeCompare(tes1.dateSuggested))), []);

  const handleToggleTaskEditSuggestionModal = (currentTaskEditSuggestion) => {
    setCurrentTaskEditSuggestion(currentTaskEditSuggestion);
    setIsTaskEditSuggestionModalOpen(!isTaskEditSuggestionModalOpen);
  };

  const SortArrow = ({sortDirection}) => {
    if (sortDirection === "asc") {
      return <i class="fa fa-arrow-up"></i>;
    } else if (sortDirection === "desc") {
      return <i class="fa fa-arrow-down"></i>;
    } else {
      return <></>;
    }
  };

  const toggleDateSuggestedSortDirection = () => {
    setUserSortDirection();
    if (dateSuggestedSortDirection == null || dateSuggestedSortDirection == "asc") {
      setTaskEditSuggestions([...taskEditSuggestions].sort((tes1, tes2) => tes2.dateSuggested.localeCompare(tes1.dateSuggested)));
      setDateSuggestedSortDirection("desc");
    } else if (dateSuggestedSortDirection == "desc") {
      setTaskEditSuggestions([...taskEditSuggestions].sort((tes1, tes2) => tes1.dateSuggested.localeCompare(tes2.dateSuggested)));
      setDateSuggestedSortDirection("asc");
    }
  };

  const toggleUserSortDirection = () => {
    setDateSuggestedSortDirection();
    if (userSortDirection == null || userSortDirection == "asc") {
      setTaskEditSuggestions([...taskEditSuggestions].sort((tes1, tes2) => tes1.user.localeCompare(tes2.user)));
      setUserSortDirection("desc");
    } else if (userSortDirection == "desc") {
      setTaskEditSuggestions([...taskEditSuggestions].sort((tes1, tes2) => tes2.user.localeCompare(tes1.user)));
      setUserSortDirection("asc");
    }
  };

  return (
    <Container>
      <h1>Task Edit Suggestions</h1>
      <Table>
        <thead>
          <tr>
            <th onClick={toggleDateSuggestedSortDirection}>Date Suggested <SortArrow sortDirection={dateSuggestedSortDirection}/></th>
            <th onClick={toggleUserSortDirection}>User <SortArrow sortDirection={userSortDirection}/></th>
            <th>Task</th>
          </tr>
        </thead>
        <tbody>
          {
            taskEditSuggestions.map((taskEditSuggestion) => 
            <TaskEditSuggestionRow
              key={taskEditSuggestion._id}
              taskEditSuggestion={taskEditSuggestion}
              handleToggleTaskEditSuggestionModal={handleToggleTaskEditSuggestionModal}
            />)
          }
        </tbody>
      </Table>
      <TaskEditSuggestionsModal 
        isTaskEditSuggestionModalOpen={isTaskEditSuggestionModalOpen}
        taskEditSuggestion={currentTaskEditSuggestion}
        handleToggleTaskEditSuggestionModal={handleToggleTaskEditSuggestionModal}
        // onApprove={handleTaskNotificationRead}
        // loggedInUserId={props.auth.user.userid}
      />
    </Container>
  );
}