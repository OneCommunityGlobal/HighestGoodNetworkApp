import "./PinterestPost.css";
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { boxStyle, boxStyleDark } from 'styles';
import { useState } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { Modal, Button } from 'react-bootstrap';


import Form from 'react-bootstrap/Form';

function PinterestPost() {

  const darkMode = useSelector(state => state.theme.darkMode);
  const [radioValue, setRadioValue] = useState('URL');

  //state for form validation
  const [validated, setValidated] = useState(false);

  //states for form input
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaItem, setMediaItem] = useState(null);

  const [showModel, setShowModel] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleClose = () => setShowModel(false);
  const handleShow = () => {
    setShowModel(true);
  }


  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    })
  };

  async function handlePost(event) {
    const form = document.querySelector('.pinterest-form');

    setValidated(true);
    event.preventDefault();
    //validate form 
    if (!form.checkValidity()) {
      event.stopPropagation();
      return;
    }

    let postValue;
    if (radioValue === 'URL') {
      postValue = {
        title, description,
        imgType: radioValue,
        mediaItems: [{
          url: mediaItem
        }]
      }
    } else {
      // const imageFile = mediaItem.files[0];
      const base64Image = await convertImageToBase64(mediaItem);
      // setMediaItem(base64Image);
      console.log(base64Image);

      postValue = {
        title, description,
        imgType: radioValue,
        mediaItems: [
          base64Image
        ]
      }
    }

    //send post pin request to the backend
    try {
      await axios.post(ENDPOINTS.POST_PINTEREST, postValue);
      toast.success('Post to Pinterest successful!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post to Pinterest!', {
        autoClose: false
      });
    }
  };

  function handleSchedule(event) {
    // event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

  // const imgOptionRadio = [
  //   { name: 'URL', value: 'URL' },
  //   { name: 'Upload', value: 'FILE' },
  // ];
  return <>
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>

      <div className="pinterest-main">
        <Form className='pinterest-form' noValidate validated={validated}>

          <Modal show={showModel} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Select Date and Time</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <input aria-label="Date and time" type="datetime-local" />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>

          {/* title input */}
          <Form.Group className="mb-1" controlId="formBasicEmail">
            <Form.Label>Title*</Form.Label>
            <Form.Control type="text" placeholder="Enter title" name="title" required onChange={(e) => setTitle(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              Please provide a valid title.
            </Form.Control.Feedback>
          </Form.Group>

          {/* description input */}
          <Form.Group className="mb-1" controlId="formBasicEmail">
            <Form.Label>Description*</Form.Label>
            <Form.Control type="text" placeholder="Enter description" required onChange={(e) => setDescription(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              Please provide a valid description.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Label>Image*</Form.Label>

          {/* image options */}
          <ToggleButtonGroup type="radio" name="options" defaultValue={"URL"}>
            <ToggleButton id="tbg-radio-1" value={"URL"} onChange={(e) => setRadioValue(e.currentTarget.value)}>
              URL
            </ToggleButton>
            <ToggleButton id="tbg-radio-2" value={"FILE"} onChange={(e) => setRadioValue(e.currentTarget.value)}>
              UPLOAD
            </ToggleButton>
          </ToggleButtonGroup>

          {/* image url */}
          {radioValue === "URL" &&
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label></Form.Label>
              <Form.Control type="text" placeholder="Enter image url" required onChange={(e) => setMediaItem(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                Please provide a valid URL.
              </Form.Control.Feedback>
            </Form.Group>
          }

          {radioValue === "FILE" &&
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label></Form.Label>
              <Form.Control type="file" accept="image/png, image/jpeg" required onChange={(e) => setMediaItem(e.target.files[0])} />
              <Form.Control.Feedback type="invalid">
                Please upload a image file.
              </Form.Control.Feedback>
            </Form.Group>
          }

          <div className="pinterest-submit-buttons">
            <input type="button"
              value="POST"
              className="pinterest-button"
              onClick={handlePost}
              style={darkMode ? boxStyleDark : boxStyle}
            />
              

            <input type="button"
              value="SCHEDULE"
              className="pinterest-button"
              onClick={handleShow}
              style={darkMode ? boxStyleDark : boxStyle} />
          </div>
        </Form>

        <div className="pinterest-schedule">
          <h3>Scheduled Post</h3>
          <div className="pinterest-scheduled-events">
            <div className="pinterest-scheduled-event">
              <h4>Title</h4>
              <p>Description will goes here</p>
            </div>

            <div className="pinterest-scheduled-event">
              <h4>Title</h4>
              <p>Description will goes here</p>
            </div>

            <div className="pinterest-scheduled-event">
              <h4>Title</h4>
              <p>Description will goes here</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </>
}

export default PinterestPost;