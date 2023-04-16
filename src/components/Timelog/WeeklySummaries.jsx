import React from 'react';
import parse from 'html-react-parser';

const WeeklySummaries = ({ userProfile }) => {
  if (!userProfile.weeklySummaries || userProfile.weeklySummaries.length < 3) {
    return <div>No weekly summaries available</div>;
  }

  const renderSummary = (title, summary) => {
    if (summary) {
      return (
        <div>
          <h3>{title}</h3>
          <p>{parse(summary)}</p>
        </div>
      );
    } else {
      return (
        <div>
          <h3>{title}</h3>
          <p>
            {userProfile.firstName} {userProfile.lastName} did not submit a summary.
          </p>
        </div>
      );
    }
  };

  return (
    <div>
      {renderSummary("This week's summary", userProfile.weeklySummaries[0]?.summary)}
      {renderSummary("Last week's summary", userProfile.weeklySummaries[1]?.summary)}
      {renderSummary("The week before last's summary", userProfile.weeklySummaries[2]?.summary)}
    </div>
  );
};

export default WeeklySummaries;
