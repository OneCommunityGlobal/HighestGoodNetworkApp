import React, { useState, useEffect } from 'react';
import { ApiEndpoint, ENDPOINTS } from '../../utils/URL';

const EventRegistration = () => {
  const [formValues, setFormValues] = useState({
    eventName: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const token = localStorage.getItem('token'); // Replace with actual key
    if (!token) {
      console.error('No token found. Please log in.');
      return;
    }
    const APIEndpoint =
      process.env.REACT_APP_APIENDPOINT || 'https://hgn-rest-beta.azurewebsites.net/api';
    console.log('api endpoint: ', ApiEndpoint);
    try {
      const response = await fetch(`${APIEndpoint}/EventRegistration`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Authorization header
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!formValues.eventName.trim()) {
      newErrors.eventName = 'Event Name is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      const APIEndpoint =
        process.env.REACT_APP_APIENDPOINT || 'https://hgn-rest-beta.azurewebsites.net/api';
      console.log('api endpoint: ', ApiEndpoint);
      try {
        const response = await fetch(`${APIEndpoint}/EventRegistration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Add Authorization header
          },
          body: JSON.stringify(formValues), // Convert formValues to JSON
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Event registered successfully:', data);
        setMessage('Event registered successfully!');
        setFormValues({ eventName: '' });
      } catch (error) {
        console.error('Error registering event:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormValues({ eventName: '' });
    setErrors({});
    setMessage('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Event Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="eventName" className="block text-gray-700 text-sm font-bold mb-2">
            Event Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formValues.eventName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.eventName && <p className="text-red-500 text-xs italic">{errors.eventName}</p>}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
      {message && <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
    </div>
  );
};

export default EventRegistration;
