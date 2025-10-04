import React from 'react';
import { Dropdown, Input } from 'reactstrap';
import './TeamsAndProjects.css';
import { useSelector } from 'react-redux';

// eslint-disable-next-line react/display-name
const AddTeamsAutoComplete = React.memo((props) => {
  const { teamsData, searchText, setSearchText, setInputs, onCreateNewTeam } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const darkMode = useSelector((state) => state.theme.darkMode);

  console.log("Teams data", teamsData)

  // Accept both shapes: { allTeams: [...] } OR just [...]
  const allTeamsRaw = teamsData?.allTeams ?? teamsData ?? [];
  const allTeams = Array.isArray(allTeamsRaw) ? allTeamsRaw : [];

  const normalize = (s) =>
    (s ?? '').toString().toLowerCase().trim().replace(/\s+/g, ' ');

  const suggestions = React.useMemo(() => {
    const q = normalize(searchText);
    if (!q) return allTeams; // show all when empty
    return allTeams.filter((t) => normalize(t.teamName).includes(q));
  }, [allTeams, searchText]);

  const handlePick = (team) => {
    setInputs(team);                 // parent expects the TEAM OBJECT
    setSearchText(team.teamName);
    setIsOpen(false);
  };

  const showCreateNew =
    !!searchText &&
    !allTeams.some((t) => normalize(t.teamName) === normalize(searchText));

  // NEW: don’t show “No teams found” when input is empty
  const shouldShowNoTeams =
    searchText.trim().length > 0 && suggestions.length === 0;

  return (
    <Dropdown
      isOpen={isOpen}
      toggle={() => setIsOpen((o) => !o)}
      style={{ width: '100%', marginRight: '5px' }}
    >
      <Input
        type="text"
        value={searchText}
        autoFocus
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        onChange={(e) => {
          setSearchText(e.target.value);
          setIsOpen(true);
        }}
        className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
        placeholder="Search or select a team..."
        aria-label="Add to Team"
      />

      {isOpen && (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu show ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
          style={{ marginTop: 0, width: '100%', maxHeight: 260, overflowY: 'auto' }}
        >
          {/* If input is empty and we have nothing yet, show nothing (quiet state) */}
          {shouldShowNoTeams ? (
            <div className="team-auto-complete text-muted" style={{ padding: '10px 12px' }}>
              No teams found
            </div>
          ) : (
            suggestions.slice(0, 100).map((item) => (
              <div
                key={item._id}
                className="team-auto-complete"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(item)}
              >
                {item.teamName}
              </div>
            ))
          )}

          {showCreateNew && (
            <div
              className="team-auto-complete"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setIsOpen(false);
                onCreateNewTeam?.(searchText);
              }}
            >
              Create new team: {searchText}
            </div>
          )}
        </div>
      )}
    </Dropdown>
  );
});

export default AddTeamsAutoComplete;
