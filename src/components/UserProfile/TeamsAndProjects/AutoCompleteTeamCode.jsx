import React, { useEffect } from 'react';
import { Spinner, Input, ListGroup, ListGroupItem } from 'reactstrap';
import { IoReload } from 'react-icons/io5';
import './autoComplete.css';

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
    isMobile,
    refInput,
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

  // prettier-ignore
  const classNameStyleP = `m-0 p-1 d-flex justify-content-center  align-items-center  list-group-item-action`;

  const styleP = {
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    width:
      // prettier-ignore
      arrayInputAutoComplete && arrayInputAutoComplete.length <= 3 ? '100%'
        :
        // prettier-ignore
       arrayInputAutoComplete && arrayInputAutoComplete.length <= 30 ? '102px': '100px',
  };
  const borderBottomRadius = { borderBottomRightRadius: '10px', borderBottomLeftRadius: '10px' };
  const styleSpinner = { ...styleP, ...borderBottomRadius, width: 'auto' };
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
    <>
      <Input
        id="teamCode"
        value={teamCode}
        onChange={handleCodeChange}
        style={darkMode ? colordark : null}
        ref={refInput}
        placeholder="X-XXX"
        onFocus={() => !showDropdown && setShowDropdown(true)}
      />
      <section>
        {showDropdown && (
          <section
            ref={refDropdown}
            className={`overflow-auto mb-2 scrollAutoComplete`}
            style={{
              height: isLoading ? '7rem' : arrayInputAutoComplete.length <= 30 ? 'auto' : '23rem',
              // prettier-ignore
              width: isLoading? 'auto' : !isMobile &&  arrayInputAutoComplete.length <=3 ? '7rem' : !isMobile ? '19rem' :
              isMobile && arrayInputAutoComplete.length <= 3? '' : '21rem',
              position: isLoading ? '' : 'relative',
              // prettier-ignore
              right: !isMobile && arrayInputAutoComplete.length <= 3? '5px' : !isMobile? '12rem' : 
                        isMobile && arrayInputAutoComplete.length <= 3? '' : '1rem'
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
              ) : inputAutoStatus != 200 ? (
                <ListGroup>
                  <ListGroupItem
                    className="d-flex justify-content-center  align-items-center "
                    onClick={fetchTeamCodeAllUsers}
                    style={darkMode ? colordarkWithBorder : null}
                  >
                    <IoReload style={styleReload} />
                  </ListGroupItem>
                </ListGroup>
              ) : (
                <div className={`${arrayInputAutoComplete.length > 3 && 'row row-cols-3'}`}>
                  {arrayInputAutoComplete.map(item => {
                    return (
                      <div
                        key={item}
                        //prettier-ignore
                        className={` ${arrayInputAutoComplete.length <= 3 ? '' : 'col col-cols-3'}`}
                      >
                        <p
                          className={classNameStyleP}
                          style={
                            //prettier-ignore
                            darkMode? { ...styleP, ...colordarkWithBorder, cursor: 'pointer'} : { ...styleP, cursor: 'pointer' }
                          }
                          onClick={() => handleCodeChange(item, (autoComplete = true))}
                        >
                          {item}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <section
                className="h-100 d-flex justify-content-center align-items-center "
                style={darkMode ? { ...styleSpinner, ...colordarkWithBorder } : styleSpinner}
              >
                <Spinner color="primary"></Spinner>
              </section>
            )}
          </section>
        )}
      </section>
    </>
  );
};
