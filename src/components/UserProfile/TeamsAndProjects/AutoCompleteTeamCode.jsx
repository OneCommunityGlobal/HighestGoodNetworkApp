import React, { useEffect } from 'react';
import { Spinner, Input } from 'reactstrap';

export const AutoCompleteTeamCode = props => {
  const {
    refDropdown,
    teamCode,
    handleCodeChange,
    setShowDropdown,
    showDropdown,
    arrayInputAutoComplete,
    inputAutoStatus,
    refInput,
  } = props;

  useEffect(() => {
    const handleClickOutside = event =>
      refDropdown.current && !refDropdown.current.contains(event.target)
        ? setShowDropdown(false)
        : null;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refDropdown]);

  const classNameStyleP = `m-0 pb-1 pt-1 d-flex justify-content-center  align-items-center  list-group-item-action`;
  const styleP = { border: '1px solid #ccc', backgroundColor: '#fff' };
  const borderBottomRadius = { borderBottomRightRadius: '10px', borderBottomLeftRadius: '10px' };
  const styleSection = { ...styleP, ...borderBottomRadius };

  let autoComplete = false;

  return (
    <section ref={refDropdown}>
      <Input
        id="teamCode"
        value={teamCode}
        onChange={handleCodeChange}
        placeholder="X-XXX"
        onFocus={() => setShowDropdown(true)}
        ref={refInput}
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
          {inputAutoStatus === 200 ? (
            arrayInputAutoComplete.length === 0 ? (
              <p className={classNameStyleP} style={styleP}>
                No options
              </p>
            ) : (
              arrayInputAutoComplete.map(item => {
                return (
                  <div key={item}>
                    <p
                      className={classNameStyleP}
                      style={{ ...styleP, cursor: 'pointer' }}
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
              style={styleSection}
            >
              <Spinner color="primary"></Spinner>
            </section>
          )}
        </div>
      ) : null}
    </section>
  );
};
