/* eslint-disable no-nested-ternary */
/* eslint-disable import/prefer-default-export */
import { useEffect } from 'react';
import { Spinner, ListGroup, ListGroupItem } from 'reactstrap';
import { IoReload } from 'react-icons/io5';
import './autoComplete.css';

export function AutoCompleteTeamCode(props) {
  const {
    refDropdown,
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
      const handleClickOutside = event => {
        if (refDropdown.current && !refDropdown.current.contains(event.target)) {
          setShowDropdown(false);
          const teamCodeInput = document.getElementById('teamCode');
          if (teamCodeInput) {
            teamCodeInput.blur();
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [refDropdown, showDropdown]);

  const classNameStyleP = `m-0 p-1 d-flex justify-content-center align-items-center list-group-item-action`;

  let width = '100px';
  if (arrayInputAutoComplete && arrayInputAutoComplete.length <= 3) {
    width = '100%';
  } else if (arrayInputAutoComplete && arrayInputAutoComplete.length <= 30) {
    width = '102px';
  }

  const styleP = {
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    width,
  };
  const borderBottomRadius = {
    borderBottomRightRadius: '10px',
    borderBottomLeftRadius: '10px',
  };

  const styleSpinner = { ...styleP, ...borderBottomRadius, width: 'auto' };
  const styleReload = { fontSize: '1.5rem', color: '#0780eb', cursor: 'pointer' };
  const colordarkWithBorder = {
    backgroundColor: '#1c2541',
    color: '#fff',
    border: '2px solid #1c5b87',
  };

  // eslint-disable-next-line no-unused-vars
  const autoComplete = false;

  return (
    <section>
      {showDropdown && (
        <section
          ref={refDropdown}
          className="overflow-auto mb-2 scrollAutoComplete"
          style={{
            height: isLoading ? '7rem' : arrayInputAutoComplete.length <= 30 ? 'auto' : '23rem',
            width: 'auto',
            position: arrayInputAutoComplete.length <= 3 || isLoading ? '' : 'relative',
          }}
        >
          {!isLoading ? (
            arrayInputAutoComplete.length === 0 ? (
              <p
                className={classNameStyleP}
                style={
                  darkMode
                    ? { ...styleP, ...colordarkWithBorder, width: 'auto' }
                    : { ...styleP, width: 'auto' }
                }
              >
                No options
              </p>
            ) : inputAutoStatus !== 200 ? (
              <ListGroup>
                <ListGroupItem
                  className="d-flex justify-content-center align-items-center"
                  onClick={fetchTeamCodeAllUsers}
                  style={darkMode ? colordarkWithBorder : null}
                >
                  <IoReload style={styleReload} />
                </ListGroupItem>
              </ListGroup>
            ) : (
              <div
                className={`${arrayInputAutoComplete.length > 3 &&
                  'row row-cols-lg-5 row-cols-sm-4'}`}
              >
                {arrayInputAutoComplete.map(item => (
                  <div
                    key={item}
                    className={`${arrayInputAutoComplete.length <= 3 ? '' : 'col col-cols-3'}`}
                  >
                    <button
                      type="button"
                      className={classNameStyleP}
                      style={
                        darkMode
                          ? { ...styleP, ...colordarkWithBorder, cursor: 'pointer' }
                          : { ...styleP, cursor: 'pointer' }
                      }
                      onClick={() => handleCodeChange(item, true)}
                    >
                      {item}
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <section
              className="h-100 d-flex justify-content-center align-items-center"
              style={darkMode ? { ...styleSpinner, ...colordarkWithBorder } : styleSpinner}
            >
              <Spinner color="primary" />
            </section>
          )}
        </section>
      )}
    </section>
  );
}
