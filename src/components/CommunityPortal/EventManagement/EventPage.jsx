import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../CommunityPortal/EventManagement/EventPage.css';
import EventManagementTabs from '../../CommunityPortal/EventManagement/EventManagementTabs';
import { useSelector } from 'react-redux';

const EventPage = () => {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const { activityid } = useParams();
  const history = useHistory();


  // Event State
  const [eventName, setEventName] = useState('Event Name');
  const [eventType, setEventType] = useState('In-person');
  const [location, setLocation] = useState('San Francisco, CA 94108');
  const [eventLink, setEventLink] = useState('https://devforum.zoom.us');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [time, setTime] = useState('9:00 AM - 11:00 AM EDT');
  const [organizer, setOrganizer] = useState('Alex Brain');
  const [capacity, setCapacity] = useState('120/200');
  const [status, setStatus] = useState('Active');
  const [rating, setRating] = useState(4);
  const [media, setMedia] = useState(null);
  const [description, setDescription] = useState('');

  // Autosave Description (Simulated)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Auto-saving description:', description);
    }, 1000);
    return () => clearTimeout(timer);
  }, [description]);

  // Media Upload Handler
  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Star Rating Display
  const renderStars = () => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ));
  };

  // Date Selection Validation (Prevent Past Dates)
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start >= today) {
      setStartDate(start);
      setEndDate(end || start);
    } else {
      alert('Cannot select past dates.');
    }
  };

  return (
    <div className={`event-page ${darkMode ? 'event-page-dark' : ''}`}>
      {/* Top Section */}
      <div className='event-card'>

        {/* Left Section: Event Image */}
        <div className='event-card__left'>
          <div className='event-card__image'>
            {media ? <img src={media} alt='Event Media' /> : <span>No Media</span>}
          </div>
          <input type='file' accept='image/*' onChange={handleMediaUpload} className='event-card__media-upload' />
        </div>

        {/* Middle Section: Event Details */}
        <div className='event-card__middle'>
          <input
            type='text'
            className={`event-card__title ${darkMode ? 'input-dark' : ''}`}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <p className='event-card__type'>
            Type:
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}
              className={darkMode ? 'status-dropdown-dark' : 'status-dropdown'}>
              <option>In-person</option>
              <option>Virtual</option>
            </select>
          </p>
          <p>Location: <input type='text' value={location} onChange={(e) => setLocation(e.target.value)}
            className={darkMode ? 'input-dark' : ''} /></p>
          <div className={`event-card_12 ${darkMode ? 'event-card_12-dark' : ''}`}>
            {/* First Row */}
            <div className={`event-card__info ${darkMode ? 'event-card__info-dark' : ''}`}>
              <div className={'info-item'}><p>📅 Date: <br></br></p>
                <DatePicker selected={startDate} onChange={handleDateChange} minDate={new Date()} selectsRange startDate={startDate} endDate={endDate} />
              </div>
              <div className='info-item'><p>⏰ Time: <br></br></p> <input type='text' value={time} onChange={(e) => setTime(e.target.value)}
                className={darkMode ? 'input-dark' : ''} /></div>
              <div className='info-item'><p>👤 Organiser: <br></br></p> <input type='text' value={organizer} onChange={(e) => setOrganizer(e.target.value)}
                className={darkMode ? 'input-dark' : ''} /></div>
            </div>

            {/* Second Row */}
            <div className={`event-card__extra ${darkMode ? 'event-card__extra-dark' : ''}`}>
              <div className='extra-item'> <p>👥 Capacity:<br></br> <input type='text' value={capacity} onChange={(e) => setCapacity(e.target.value)}
                className={darkMode ? 'input-dark' : ''} /></p></div>
              <div className='extra-item'> <p>⭐ Overall Rating: <br></br> {renderStars()}</p></div>
              <div className='extra-item'> <p>Status:<br></br>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className={`status-dropdown ${darkMode ? 'status-dropdown-dark' : ''}`}>

                  <option>Active</option>
                  <option>Finished</option>
                  <option>Participated</option>
                </select>
              </p></div>
            </div>
          </div>
        </div>

        {/* Right Section: Calendar */}
        <div className={`event-card__right ${darkMode ? 'event-card__right-dark' : ''}`}>
          <Calendar
            className={darkMode ? 'react-calendar dark-mode' : 'react-calendar'}
            onChange={(date) => {
              if (date >= new Date().setHours(0, 0, 0, 0)) {
                setStartDate(date);
                setEndDate(date); // Update endDate dynamically
              } else {
                alert('Cannot select past dates.');
              }
            }}
            value={startDate}
            minDate={new Date()} // Prevent past date selection
            tileClassName={({ date, view }) => {
              if (view === 'month' && date < new Date().setHours(0, 0, 0, 0)) {
                return 'react-calendar__tile--disabled';
              }
              return null;
            }}
          />
        </div>
      </div>

      {/* Bottom Section - Tabs */}
      <div className='event-tabs'>
        <EventManagementTabs activityid={activityid} history={history} />
      </div>

      {/* Description Section */}
      <div className='event-description'>
        <textarea
          className='textarea'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Enter event description...'
        />
        <div className='media-upload-container'>
          <input
            type='file'
            accept='image/*'
            onChange={handleMediaUpload}
            className='description-media-upload'
          />
          <button
            type='button'
            className={`post-btn ${darkMode ? 'post-btn-dark' : ''}`}
            onClick={() => console.log('Posting description:', description)}
          >
            Post Description
          </button>
        </div>
      </div>
    </div>
  );

};

export default EventPage;
