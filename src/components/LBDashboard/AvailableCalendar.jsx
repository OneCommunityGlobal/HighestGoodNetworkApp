import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CustomCalendar.css";  

const MyCalendar = () => {
  const [date, setDate] = useState(new Date());


  const bookedDates = ["2025-01-10", "2025-01-15", "2025-01-24"];
  const availableForBid = ["2025-01-08", "2025-01-17", "2025-01-25"];
  const BlockedOutDates = ["2025-01-05", "2025-01-20", "2025-01-28"];

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];

      if (bookedDates.includes(dateStr)) return "booked";
      if (availableForBid.includes(dateStr)) return "available-for-bid";
      if (BlockedOutDates.includes(dateStr)) return "BlockedOutDates";
    }
    return "";
  };

  return (
    <div className="calendar-container">
      <h1>Unit 405 Earthbag Village</h1>
      <Calendar onChange={setDate} value={date} tileClassName={tileClassName} />
      <div className="legend">
        <div className="legend-item"><span className="booked"></span> Booked Dates</div>
        <div className="legend-item"><span className="available-for-bid"></span> Available Dates</div>
        <div className="legend-item"><span className="BlockedOutDates"></span> Blocked-Out Dates</div>
      </div>
    </div>
  );
};

export default MyCalendar;
