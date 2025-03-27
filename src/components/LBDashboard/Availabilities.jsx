import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';
import './Available.css';
import logo from '../../assets/images/logo2.png';
import MyCalendar from './AvailableCalendar';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import HouseCarousel from "./HouseCarousel";
import ContactHostButton from './ContactHostButton';
import BookingHistoryButton from './BookingHistoryButton';
import { useHistory } from 'react-router-dom';

import houseImg from "./houseImg.png";

function Availabilities() {
  const history = useHistory();
  // history.push('/lbdashboard/mastermap');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // this user's past and upcoming booking of this unit
  const sampleBookings = [
    { date: '2025-04-01', unitName: 'Unit 405 Earthbag Village' },
    { date: '2025-03-01', unitName: 'Unit 405 Earthbag Village' },
    { date: '2024-12-10', unitName: 'Unit 405 Earthbag Village' },
  ];


  const [errors, setErrors] = useState({});

  const regex = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-_=+{};:,<.>]{8,}$/,
  };

  const validateInput = (name, value) => {
    if (!regex[name].test(value)) {
      return `Invalid ${name}`;
    }
    return '';
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: validateInput(name, value) });
    }
  };

  const handleSubmit = async e => {
    // TODO: Login data has to be compared with the data in the database
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateInput(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axios.post(ENDPOINTS.LB_LOGIN, formData); // This is where you put the actual endpoint for the Login

      window.location.href = '/lbdashboard'; // TODO: Replace with your actual redirect logic if route is defferent
    } catch (error) {
      toast.error('Error logging in! Please try again.');
    }
  };


  return (
    <div className="available-page lb-available-page">
      <div className="logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className="form-container bg-pink">


        <div className="form-top bg-black" />


        <div className="available-form-main flex flex-col md:flex-row gap-8">

          <div className="available-form-main-left grid grid-cols-2 flex">
            <HouseCarousel />

            <div className="text-left mt-4 w-full px-4">
              <div className="grid grid-cols-2 gap-8">

                <div>
                  <h2 className="text-md text-black ">Available amenities in this Unit:</h2>
                  <ul className="list-disc pl-5">
                    <li>Artistic Interiors</li>
                    <li>Private Rainwater Collection</li>
                    <li>Solar-Powered Lighting and Charging</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-bold">Village level amenities:</h2>
                  <ul className="list-disc pl-5">
                    <li>Central Tropical Atrium</li>
                    <li>Eco-Showers and Toilets</li>
                    <li>Solar Power Infrastructure</li>
                    <li>Passive Heating and Cooling</li>
                    <li>Community Gardens</li>
                    <li>Rainwater Harvesting Systems</li>
                    <li>Workshops and Demonstration Spaces</li>
                  </ul>
                </div>
              </div>

            </div>



            <div className="flex items-center space-x-2 mt-4">
              {/* map icon */}
              <span className="text-red-500 text-xl">📍</span>


              <a href="#" className="text-blue-600 underline hover:text-blue-800">
                View on Property Map
              </a>
            </div>
          </div>


          <div className="available-form-main-right flex">


            < MyCalendar />
            <br />


            <button
              onClick={() => history.push('/lbdashboard/mastermap')}
              className="text-blue-600 underline hover:text-blue-800"
            >
              View on Property Map
            </button>

            <ContactHostButton />

            <BookingHistoryButton bookings={sampleBookings} />

          </div>
        </div>

      </div>
    </div>
  );
}

export default Availabilities;

