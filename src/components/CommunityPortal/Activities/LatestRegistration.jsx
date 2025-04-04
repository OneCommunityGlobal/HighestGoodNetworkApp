import React from "react";
import "./styles.css";

const LatestRegistration = () => {
    return (
        <div className="latest-registration">
            <h2>Latest Registration</h2>
            <ul>
            <li>
                    <div className="registerinfo">
                        <p><strong>Marvin McKinney</strong> applied for the event <strong>Tree Planting</strong></p>
                        <span className="time">10 mins ago</span>
                    </div>
                    <button className="approve-btn">Approve</button>
                </li>
                <li>
                    <div className="registerinfo">
                        <p><strong>Jane Copper</strong> applied for the event <strong>Tree Planting</strong></p>
                        <span className="time">13 mins ago</span>
                    </div>
                    <button className="approve-btn">Approve</button>
                </li>
                <li>
                    <div className="registerinfo">
                        <p><strong>Jenny Wilson</strong> applied for the event <strong>Home Cookies</strong></p>
                        <span className="time">21 mins ago</span>
                    </div>
                    <button className="approve-btn">Approve</button>
                </li>

            </ul>
        </div>
    );
};

export default LatestRegistration;
