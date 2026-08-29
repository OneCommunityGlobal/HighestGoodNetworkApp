import { useState, useEffect } from 'react';

function TimeDifference(props) {
//    const { isUserSelf, userProfile } = props;
    const { isUserSelf } = props;
    const [signedOffset, setSignedOffset] = useState('N/A');
    const [hoverText, setHoverText] = useState('');

    const viewingTimeZone = props.userProfile.timeZone;
    const yourLocalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
        if (isUserSelf) {
            setSignedOffset('N/A');
            setHoverText('');
            return;
        }

        const convertDateToAnotherTimeZone = (date, timezone) => {
            try {
                const dateString = date.toLocaleString('en-US', { timeZone: timezone });
                return new Date(dateString);
            } catch (err) {
                return NaN;
            }
        };

        const getOffsetBetweenTimezones = (date, tz1, tz2) => {
            const tz1Date = convertDateToAnotherTimeZone(date, tz1);
            const tz2Date = convertDateToAnotherTimeZone(date, tz2);

            // if (!isNaN(tz1Date) && !isNaN(tz2Date)) {
            if (!Number.isNaN(tz1Date) && !Number.isNaN(tz2Date)) {
                const offset = (tz1Date.getTime() - tz2Date.getTime()) / 3600000;
                return offset;
            }
            return null;
        };

        const offset = getOffsetBetweenTimezones(new Date(), viewingTimeZone, yourLocalTimeZone);
        if (offset !== null) {
            const formattedOffset = offset > 0 ? `+${offset}` : `${offset}`;
            setSignedOffset(formattedOffset);
            let message = '';
            if (offset === 0) {
                message = 'This person is in the same time zone as you';
            } else {
                const direction = offset > 0 ? 'ahead of' : 'behind';
                message = `This person is ${Math.abs(offset)} hours ${direction} your time zone`;
            }
            setHoverText(message);
        }
    }, [isUserSelf, viewingTimeZone, yourLocalTimeZone]);

    return <span className="time_difference" title={hoverText}>{signedOffset}</span>;
}

export default TimeDifference;