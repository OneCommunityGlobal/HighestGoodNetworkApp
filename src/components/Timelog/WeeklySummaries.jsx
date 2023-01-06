import React from 'react';

const WeeklySummaries = ({ userProfile }) => {
  return (
    <div>
      {userProfile.weeklySummaries[0].summary ? (
        <div>
          <h4>This week's summary</h4>
          <h4>{userProfile.weeklySummaries[0].summary}</h4>
        </div>
      ) : (
        <h4>
          {userProfile.firstName} {userProfile.lastName} did not submit a summary for this week.
        </h4>
      )}
      {userProfile.weeklySummaries[1].summary ? (
        <div>
          <h4>Last week's summary</h4>
          <h4>{userProfile.weeklySummaries[1].summary}</h4>
        </div>
      ) : (
        <h4>
          {userProfile.firstName} {userProfile.lastName} did not submit a summary last week.
        </h4>
      )}
      {userProfile.weeklySummaries[2].summary ? (
        <div>
          <h4>The week before last's summary</h4>
          <h4>{userProfile.weeklySummaries[2].summary}</h4>
        </div>
      ) : (
        <h4>
          {userProfile.firstName} {userProfile.lastName} did not submit a summary for the week
          before last.
        </h4>
      )}
    </div>
  );
};

export default WeeklySummaries;
