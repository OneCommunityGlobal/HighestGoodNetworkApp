import React, { useEffect } from 'react';
import { Spinner, Input, ListGroup, ListGroupItem } from 'reactstrap';
import { IoReload } from 'react-icons/io5';

export const AutoCompleteTeamCode = props => {
  const {
    refDropdown,
    teamCode,
    handleCodeChange,
    setShowDropdown,
    showDropdown,
    arrayInputAutoComplete,
    inputAutoStatus,
    isLoading,
    fetchTeamCodeAllUsers,
    darkMode,
  } = props;

  useEffect(() => {
    if (showDropdown) {
      const handleClickOutside = event =>
        refDropdown.current && !refDropdown.current.contains(event.target)
          ? (setShowDropdown(false), document.getElementById('teamCode').blur())
          : null;
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [refDropdown, showDropdown]);

  const classNameStyleP = `m-0 pb-1 pt-1 d-flex justify-content-center  align-items-center  list-group-item-action`;
  const styleP = { border: '1px solid #ccc', backgroundColor: '#fff' };
  const borderBottomRadius = { borderBottomRightRadius: '10px', borderBottomLeftRadius: '10px' };
  const styleSection = { ...styleP, ...borderBottomRadius };
  const styleReload = { fontSize: '1.5rem', color: '#0780eb', cursor: 'pointer' };
  const colordarkWithBorder = {
    backgroundColor: '#1c2541',
    color: '#fff',
    border: '2px solid #1c5b87',
  };
  const colordark = {
    backgroundColor: '#1c2541',
    color: '#fff',
    outline: 'none',
    border: 'none',
  };

  let autoComplete = false;

  return (
    <section ref={refDropdown}>
      <Input
        id="teamCode"
        value={teamCode}
        onChange={handleCodeChange}
        style={darkMode ? colordark : null}
        placeholder="X-XXX"
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown ? (
        <div
          style={
            arrayInputAutoComplete.length <= 3 && inputAutoStatus === 200
              ? { height: 'auto', width: 'auto' }
              : { height: '6rem', width: 'auto' }
          }
          className=" overflow-auto mb-2"
        >
          {!isLoading ? (
            arrayInputAutoComplete.length === 0 ? (
              <p
                className={classNameStyleP}
                style={darkMode ? { ...styleP, ...colordarkWithBorder } : styleP}
              >
                No options
              </p>
            ) : inputAutoStatus != 200 ? (
              <ListGroup>
                <ListGroupItem
                  className="d-flex justify-content-center  align-items-center  "
                  onClick={fetchTeamCodeAllUsers}
                  style={darkMode ? colordarkWithBorder : null}
                >
                  <IoReload style={darkMode ? styleReload : styleReload} />
                </ListGroupItem>
              </ListGroup>
            ) : (
              arrayInputAutoComplete.map(item => {
                return (
                  <div key={item}>
                    <p
                      className={classNameStyleP}
                      style={
                        darkMode
                          ? { ...styleP, ...colordarkWithBorder, cursor: 'pointer' }
                          : { ...styleP, cursor: 'pointer' }
                      }
                      onClick={() => handleCodeChange(item, (autoComplete = true))}
                    >
                      {item}
                    </p>
                  </div>
                );
              })
            )
          ) : (
            <section
              className="h-100 d-flex justify-content-center align-items-center "
              style={darkMode ? { ...styleSection, ...colordarkWithBorder } : styleSection}
            >
              <Spinner color="primary"></Spinner>
            </section>
          )}
        </div>
      ) : null}
    </section>
  );
};
