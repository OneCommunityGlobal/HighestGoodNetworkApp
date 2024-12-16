
// //REMOVE CURRENT - OLD API CODE WHEN THE BACKEND Abi weekly summary reports page gets updated.
//Currently Considering Old and New format of the api
export const normalizeVolunteerStatus = (volunteerStatus, totalHoursWorked) => {
    if (!volunteerStatus || typeof volunteerStatus !== 'object') {
      console.warn('Invalid volunteer data');
      return {};
    }
  
    const normalizedVolunteerStatusData = {};
  
    const { activeVolunteers, deactivatedVolunteers, newVolunteers } = volunteerStatus;
  
    // ACTIVE VOLUNTEERS
    normalizedVolunteerStatusData['activeVolunteers'] =
      Array.isArray(activeVolunteers)
        ? {
            count: activeVolunteers[0]?.activeVolunteersCount || 0,
            comparisonPercentage: 0.02,
          }
        : { ...activeVolunteers };
  
    // DEACTIVATED VOLUNTEERS
    normalizedVolunteerStatusData['deactivatedVolunteers'] =
      Array.isArray(deactivatedVolunteers)
        ? {
            count: deactivatedVolunteers[0]?.deactivedVolunteersCount || 0,
            comparisonPercentage: 0.02,
          }
        : { ...deactivatedVolunteers };
  
    // NEW VOLUNTEERS
    normalizedVolunteerStatusData['newVolunteers'] =
      Array.isArray(newVolunteers)
        ? {
            count: newVolunteers[0]?.newVolunteersCount || 0,
            comparisonPercentage: 0.02,
          }
        : { ...newVolunteers };
  
    // TOTAL HOURS WORKED
    normalizedVolunteerStatusData['totalHoursWorked'] =
      Array.isArray(totalHoursWorked)
        ? {
            current: 161.93333333333334,
            comparison: 342.56666666666666,
            percentage: -0.53,
          }
        : { ...totalHoursWorked };
  
    return normalizedVolunteerStatusData;
  };
  


  export const normalizeVolunteerActivities = (data) => {
    if (!data || typeof data !== 'object') {
      console.warn('Invalid volunteer activities data');
      return {};
    }
  
    const normalizedData = {};
  
    const {
      totalBadgesAwarded,
      totalActiveTeams,
      completedTasks,
      totalSummariesSubmitted,
      volunteersCompletedAssignedHours
    } = data;
  
    // Total Badges Awarded
    if (Array.isArray(totalBadgesAwarded)) {
      normalizedData["totalBadgesAwarded"] = {
        count: totalBadgesAwarded[0]?.badgeCollection || 0,
        comparisonPercentage: 0.02, // Default percentage
      };
    } else if (typeof totalBadgesAwarded === "object") {
      normalizedData["totalBadgesAwarded"] = { ...totalBadgesAwarded };
    }
  
    // Total Active Teams
    if (Array.isArray(totalActiveTeams)) {
      normalizedData["totalActiveTeams"] = {
        count: totalActiveTeams[0]?.activeTeams || 0,
        comparisonPercentage: 0.02, // Default percentage
      };
    } else if (typeof totalActiveTeams === "object") {
      normalizedData["totalActiveTeams"] = { ...totalActiveTeams };
    }
  
    // Completed Tasks
    if (Array.isArray(completedTasks)) {
      normalizedData["completedTasks"] = {
        count: completedTasks.count || 0,
        comparisonPercentage: 0.02, // Default percentage
      };
    } else if (typeof completedTasks === "object") {
      normalizedData["completedTasks"] = { ...completedTasks };
    }
  
    // Total Summaries Submitted (Old API doesn't have this; default to 0)
    if (!totalSummariesSubmitted) {
      normalizedData["totalSummariesSubmitted"] = {
        count: 0,
        comparisonPercentage: 0.02, // Default percentage
      };
    } else if (typeof totalSummariesSubmitted === "object") {
      normalizedData["totalSummariesSubmitted"] = { ...totalSummariesSubmitted };
    }

    if (!volunteersCompletedAssignedHours) {
      normalizedData["volunteersCompletedAssignedHours"] = {
        count: 0,
        comparisonPercentage: 0.02, // Default percentage
      };
    } else if (typeof volunteersCompletedAssignedHours === "object") {
      normalizedData["volunteersCompletedAssignedHours"] = { ...volunteersCompletedAssignedHours };
    }


    
  
    return normalizedData;
  };
  