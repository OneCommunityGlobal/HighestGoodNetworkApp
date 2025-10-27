/* eslint-disable react/jsx-props-no-spreading */

import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';
import hasPermission from '../../utils/permissions';
import WarningIcon from './WarningIcon';
import styles from './Warnings.module.css';

function WarningIcons({
  handleWarningIconClicked,
  warnings,
  warningText,
  handleShowWarningModal,
  numberOfWarnings,
  userProfileModal,
  handleIssueWarning,
}) {
  const filledWarnings = warnings.concat(Array.from({ length: Math.max(8 - warnings.length, 0) }));
  const dispatch = useDispatch();

  const canIssueTrackingWarnings = dispatch(hasPermission('issueTrackingWarnings'));
  const canIssueBlueSquare = dispatch(hasPermission('issueBlueSquare'));
  const canDeleteWarning = dispatch(hasPermission('deleteWarning'));

  return (
    <div className={`${styles['warning-icons']}`}>
      {filledWarnings.slice(0, 8).map(warning => {
        if (warning) {
          return (
            <WarningIcon
              key={warning._id}
              id={warning._id}
              handleWarningIconClicked={handleWarningIconClicked}
              {...warning}
              warningText={warningText}
              handleShowWarningModal={handleShowWarningModal}
              numberOfWarnings={numberOfWarnings}
              handleIssueWarning={handleIssueWarning}
              canIssueTrackingWarnings={canIssueTrackingWarnings}
              canIssueBlueSquare={canIssueBlueSquare}
              canDeleteWarning={canDeleteWarning}
              userProfileModal={userProfileModal}
            />
          );
        }
        return (
          <WarningIcon
            id={uuidv4()}
            key={uuidv4()}
            handleWarningIconClicked={handleWarningIconClicked}
            warningText={warningText}
            handleShowWarningModal={handleShowWarningModal}
            numberOfWarnings={numberOfWarnings}
            handleIssueWarning={handleIssueWarning}
            canIssueTrackingWarnings={canIssueTrackingWarnings}
            canIssueBlueSquare={canIssueBlueSquare}
            canDeleteWarning={canDeleteWarning}
            userProfileModal={userProfileModal}
          />
        );
      })}
    </div>
  );
}

export default WarningIcons;
