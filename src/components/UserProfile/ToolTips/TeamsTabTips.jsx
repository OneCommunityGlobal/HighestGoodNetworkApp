import { useState } from 'react';
import { Tooltip } from 'reactstrap';

function TeamsTabTips() {
  const [teamCodeExplainTooltip, setTeamCodeExplainTooltip] = useState(false);
  const toggleTeamCodeExplainTooltip = () => setTeamCodeExplainTooltip(!teamCodeExplainTooltip);
  return (
    <div data-testid="test-teamstabtips" id='teamCodeAssign'>

      <Tooltip
        placement="top"
        modifiers={{ preventOverflow: { boundariesElement: 'window' } }}
        isOpen={teamCodeExplainTooltip}
        target="teamCodeAssign"
        toggle={toggleTeamCodeExplainTooltip}
        data-testid="teamstabtiptest-1"
      >
        This team code should only be used by admin/owner, and has nothing to do with
        the team data model.
      </Tooltip>
    </div>
  )
}
export default TeamsTabTips
