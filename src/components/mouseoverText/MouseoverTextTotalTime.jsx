import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getMouseoverText } from '../../actions/mouseoverTextAction';

function MouseoverTextTotalTime({ getMouseoverText, mouseoverText, onUpdate }) {
    useEffect(() => {
        getMouseoverText();
        if (mouseoverText) {
            onUpdate(mouseoverText);
        }
    }, [getMouseoverText, mouseoverText, onUpdate]);

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

export default connect(mapStateToProps, mapDispatchToProps)(MouseoverTextTotalTime);
