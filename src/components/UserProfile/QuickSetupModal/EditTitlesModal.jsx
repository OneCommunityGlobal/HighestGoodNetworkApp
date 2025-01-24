import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

const EditTitlesModal = ({ isOpen, toggle, titles, refreshModalTitles, darkMode }) => {
  const [orderedTitles, setOrderedTitles] = useState([]);

  useEffect(() => {
    if (titles && titles.length > 0) {
      setOrderedTitles(titles);
    }
  }, [titles]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(orderedTitles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setOrderedTitles(items);
  };

  const handleSave = async () => {
    try {
      const orderData = orderedTitles.map((title, index) => ({
        id: title._id,
        order: index + 1
      }));
      console.log('Sending order data:', orderData);
  
      const url = ENDPOINTS.REORDER_TITLES();
      const response = await axios.put(url, { orderData });
      console.log('Server response:', response.data);
      
      await refreshModalTitles();
      toggle();
    } catch (error) {
      console.error("Error saving title order: ", error);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={darkMode ? 'text-light dark-mode' : ''}
      style={{ maxHeight: '100vh' }}
    >
      <ModalHeader 
        toggle={toggle}
        className={darkMode ? 'bg-space-cadet' : ''}
      >
        Edit Titles Order
      </ModalHeader>
      <ModalBody 
        className={darkMode ? 'bg-yinmn-blue' : ''} 
        style={{ 
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 200px)'
        }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="titles">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="titles-list"
                style={{ minHeight: '100%' }}
              >
                {orderedTitles.map((title, index) => (
                  <Draggable 
                    key={title._id} 
                    draggableId={title._id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`role-buttons ${snapshot.isDragging ? 'dragging' : ''}`}
                      style={{
                        ...provided.draggableProps.style,
                        padding: '10px',
                        margin: '8px 0',
                        backgroundColor: darkMode ? '#2c3e50' : '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'grab'
                      }}
                    >
                      {title?.titleCode ? title.titleCode : title?.titleName?.substring(0, 5)}
                    </div>
                  )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave}>
          Save Order
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditTitlesModal;
