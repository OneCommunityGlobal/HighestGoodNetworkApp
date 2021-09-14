import { useState, useEffect } from 'react'
import timeZoneMap from 'constants/timeZones'

/**
 *
 * @param {string} [props.filter=] Filter text
 * @param {func} [props.onChange=]
 * @param {string} [props.id=timeZone] 'id' HTML property of component
 * @param {string} [props.name=timeZone] 'name' HTML property of component
 * @param {string} [props.selected=] Name of the time zone selected by default
 */
const TimeZoneDropDown = props => {

    const id = props.id || 'timeZone'

    useEffect(() => {
        if(props.filter !== undefined && props.filter !== '') {
            const element = document.getElementById(id);
            element.dispatchEvent(new Event('change', {bubbles: true}))
        }
    }, [props.filter])

  return (
    <select
        id={props.id || 'timeZone'}
        name={props.name || 'timeZone'}
        className="form form-control"
        onChange={props.onChange}
        defaultValue={props.selected}
    >
      {Object.keys(timeZoneMap).map(timeZoneName => {
        const timeZoneString = `${timeZoneName} (UTC${timeZoneMap[timeZoneName].utcOffset})`;
        if (
          !props.filter ||
          timeZoneString
            .toLocaleLowerCase()
            .split('_').join(' ')
            .includes(props.filter.toLocaleLowerCase())
        ) {
          return (
            <option value={timeZoneName} key={`timeZone-${timeZoneName}`}>
              {timeZoneString}
            </option>
          )
        }
      })}
    </select>
  )
}

export default TimeZoneDropDown
