import React, { useState, useEffect } from 'react';
import { ENDPOINTS } from '../../utils/URL';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { getMouseoverText, createMouseoverText, updateMouseoverText } from '../../actions/mouseoverTextAction';


function MouseoverTextTotalTimeEditButton({
    getMouseoverText,
    createMouseoverText,
    updateMouseoverText,
    onUpdate,
    mouseoverText,
    mouseoverTextId,
}) {
    const [text, setText] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [newText, setNewText] = useState('');

    useEffect(() => {
        getMouseoverText();
        if (mouseoverText) {
            setText(mouseoverText);
            onUpdate(mouseoverText);
        }
    }, [getMouseoverText, mouseoverText, onUpdate]);


    const handleUpdateText = () => {
        setModalOpen(true);
    };

    const handleSaveText = () => {
        const mouseoverText = {
            newMouseoverText: newText,
        };
        if (text) {
            updateMouseoverText(mouseoverTextId, mouseoverText);
            toast.success('Mouseover Text updated!');
        } else {
            createMouseoverText(mouseoverText);
            toast.success('Mouseover Text created!');
        }
        setModalOpen(false);
        setText(newText);
        onUpdate(newText);
    };

    const handleCancelSave = () => {
        setModalOpen(false);
    };


    return (
        <div>
            <div>
                <i
                    className="fa fa-pencil-square-o"
                    aria-hidden="true"
                    style={{ marginLeft: '5px', cursor: 'pointer' }}
                    onClick={handleUpdateText}
                ></i>
                <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
                    <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Edit Mouseover Text</ModalHeader>
                    <ModalBody>
                        <Label for="newText">New Text</Label>
                        <Input
                            type="text"
                            name="newText"
                            id="newText"
                            onChange={(e) => setNewText(e.target.value)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleSaveText}>
                            Save
                        </Button>{' '}
                        <Button color="secondary" onClick={handleCancelSave}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        </div>
    );
}




const mapStateToProps = (state) => {
    return {
        mouseoverText: state?.mouseoverText?.[0]?.mouseoverText,
        mouseoverTextId: state?.mouseoverText?.[0]?._id,
    };
};

const mapDispatchToProps = dispatch => ({
    getMouseoverText: () => dispatch(getMouseoverText()),
    createMouseoverText: mouseoverText => dispatch(createMouseoverText(mouseoverText)),
    updateMouseoverText: (mouseoverTextId, mouseoverText) =>
        dispatch(updateMouseoverText(mouseoverTextId, mouseoverText)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MouseoverTextTotalTimeEditButton);





