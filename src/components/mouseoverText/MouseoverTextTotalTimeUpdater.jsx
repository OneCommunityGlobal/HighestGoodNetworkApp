import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getMouseoverText } from '../../actions/mouseoverTextAction';

function MouseoverTextTotalTimeUpdater({ getMouseoverText, mouseoverText, onUpdate }) {
    useEffect(() => {
        getMouseoverText();
    }, [getMouseoverText]);

    useEffect(() => {
        if (mouseoverText) {
            onUpdate(mouseoverText); // Call the onUpdate function to pass the mouseoverText value to the parent component
        }
    }, [mouseoverText, onUpdate]);

    return null;
}

const mapStateToProps = (state) => {
    return {
        mouseoverText: state?.mouseoverText?.[0]?.mouseoverText,
    };
};

const mapDispatchToProps = (dispatch) => ({
    getMouseoverText: () => dispatch(getMouseoverText()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MouseoverTextTotalTimeUpdater);
