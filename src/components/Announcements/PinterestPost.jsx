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
import { CloseButton } from 'react-bootstrap';


import Form from 'react-bootstrap/Form';
import { useEffect, useRef } from "react";

function PinterestPost() {

  const darkMode = useSelector(state => state.theme.darkMode);
  const [radioValue, setRadioValue] = useState('URL');

  //state for form validation
  const [validated, setValidated] = useState(false);

  //states for form input
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [mediaItem, setMediaItem] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const imageFileRef = useRef(null);

  const [showModel, setShowModel] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(null);

  const [scheduleList, setScheduleList] = useState([]);
  const [scheduleUpdate, setScheduleUpdate] = useState(false);

  const handleClose = () => setShowModel(false);
  const handleShow = () => {
    setShowModel(true);
  }


  useEffect(() => {
    async function fetchScheduleList() {
      try {
        const scheduleList = (await axios.get(ENDPOINTS.SCHEDULE_PINTEREST)).data;
        setScheduleList(scheduleList);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch pinterest schedule list!', {
        });
      }
    }
    fetchScheduleList();
  }, [scheduleUpdate]);

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    })
  };

  async function getPostValue() {
    let postValue;
    if (radioValue === 'URL') {
      postValue = {
        title, description,
        imgType: radioValue,
        mediaItems: {
          url: imageUrl
        }
      }
    } else {
      const base64Image = await convertImageToBase64(imageFileRef.current.files[0]);
      // setMediaItem(base64Image);
      console.log(base64Image);

      postValue = {
        title, description,
        imgType: radioValue,
        mediaItems:
          base64Image
      }
    }
    return postValue;
  }

  function resetForm(){
    setValidated(false);
    setTitle('');
    setDescription('');
    // setRadioValue('URL');
    setScheduleUpdate(!scheduleUpdate);
    setImageUrl("");
    if(imageFileRef.current){
      imageFileRef.current.value = null;
    }

  }

  async function handlePost(event) {
    const form = document.querySelector('.pinterest-form');

    setValidated(true);
    event.preventDefault();
    //validate form 
    if (!form.checkValidity()) {
      event.stopPropagation();
      return;
    }

    let postValue = await getPostValue();
    console.log(postValue);

    try {
      await axios.post(ENDPOINTS.POST_PINTEREST, postValue);
      toast.success('Post to Pinterest successful!');
      resetForm();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.error || 'Failed to post to Pinterest!', {
        autoClose: false
      });
    }
  };

  async function handleSchedule(event) {
    // event.preventDefault();
    const form = document.querySelector('.pinterest-form');
    setValidated(true);
    event.preventDefault();
    //validate form 
    if (!form.checkValidity()) {
      event.stopPropagation();
      return;
    }
    handleShow();

  }

  async function sendSchedule() {
    let postData = await getPostValue();
    console.log('***** postData *****')
    console.log(postData);
    console.log(scheduledTime);
    try {
      await axios.post(ENDPOINTS.SCHEDULE_PINTEREST, { ...postData, scheduledTime });
      toast.success('Schedule Pin successful!');
      resetForm();
    } catch (e) {
      toast.error(err.response?.data?.error || 'Failed to post to Pinterest!', {
        autoClose: false
      });
    }
    handleClose();
  }

  async function deleteSchedule(id) {
    try {
      await axios.delete(`${ENDPOINTS.SCHEDULE_PINTEREST}/${id}`);
      toast.success('Scheduled post deleted successfully!');
      setScheduleUpdate(!scheduleUpdate);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete scheduled post!', {
        autoClose: false
      });
    }
  }

  function scheduleCard(title, description, image, time, id) {
    const scheduledTime = new Date(time);

    return <div className="schedule-card" key={id}>
      <CloseButton
        onClick={async () => deleteSchedule(id)}
        style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
      />
      <div className="schedule-title">{title}</div>
      <div className="schedule-time">{scheduledTime.toLocaleDateString()} &nbsp; {scheduledTime.toLocaleTimeString()}</div>
      <div className="schedule-description">{description}</div>
      <img src={image} alt="image" />
    </div>

  }


  return <>
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>

      <div className="pinterest-main">
        <Form className='pinterest-form' noValidate validated={validated}>
          <h3 className={darkMode ? 'text-light' : 'text-dark'}>Post to Social Media</h3>

          <Modal show={showModel} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Select Date and Time</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input aria-label="Date and time" type="datetime-local" min={new Date().toISOString().slice(0, 16)} onChange={(e) => setScheduledTime(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={sendSchedule}>
                Submit
              </Button>
            </Modal.Footer>
          </Modal>

          {/* title input */}
          <Form.Group className="mb-1" controlId="formBasicEmail">
            <Form.Label>Title*</Form.Label>
            <Form.Control type="text" placeholder="Enter title" name="title" value={title} required onChange={(e) => setTitle(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              Please provide a valid title.
            </Form.Control.Feedback>
          </Form.Group>

          {/* description input */}
          <Form.Group className="mb-1" controlId="formBasicEmail">
            <Form.Label>Description*</Form.Label>
            <Form.Control type="text" placeholder="Enter description" value={description} required onChange={(e) => setDescription(e.target.value)} />
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
              <Form.Control type="text" placeholder="Enter image url" value={imageUrl} required onChange={(e) => setImageUrl(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                Please provide a valid URL.
              </Form.Control.Feedback>
            </Form.Group>
          }

          {radioValue === "FILE" &&
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label></Form.Label>
              <Form.Control type="file" accept="image/png, image/jpeg" ref={imageFileRef} required />
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
              onClick={handleSchedule}
              style={darkMode ? boxStyleDark : boxStyle} />
          </div>
        </Form>

        <div className="pinterest-schedule">
          <h3 className={darkMode ? 'text-light' : 'text-dark'}>Scheduled Post</h3>
          {scheduleList.map((item, index) => {
            const postData = JSON.parse(item.postData);
            const title = postData.title;
            const description = postData.description;
            const image = postData.media_source.url ? postData.media_source.url : `data:image/png;base64,${postData.media_source.data}`;
            const scheduleTime = item.scheduledTime;
            const id = item._id;
            return scheduleCard(title, description, image, scheduleTime, id);
          })

          }
        </div>

      </div>
    </div>
  </>
}

export default PinterestPost;