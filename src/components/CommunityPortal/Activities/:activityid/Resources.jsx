import React from "react";
import "./Resources.css";

const Resources = () => {
    const data = [
        { sNo: 1, name: "Harsh Kadyan", materials: "????", facilities: "Software Engineer Team", status: { text: "Debited", color: "green" }, dueDate: "23 April 2025" },
        { sNo: 2, name: "John Doe", materials: "????", facilities: "HR Facilities", status: { text: "Partially Debited", color: "yellow" }, dueDate: "12 May 2025" },
        { sNo: 3, name: "Jane Smith", materials: "????", facilities: "IT Equipment", status: { text: "Not Debited", color: "red" }, dueDate: "15 March 2025" },
        { sNo: 4, name: "Alex Brown", materials: "????", facilities: "Admin Facilities", status: { text: "Debited", color: "green" }, dueDate: "20 April 2025" },
    ];

    return (
        <div className="resources-usage">
            <h2 className="resource-title">Resource Usage Monitoring</h2>

            {/* header for column */}
            <div className="resource-row header">
                <div className="column">S.No</div>
                <div className="column">Name</div>
                <div className="column">Materials</div>
                <div className="column">Facilities</div>
                <div className="column">Status</div>
                <div className="column">Due Date</div>
                <div className="column">Actions</div>
            </div>

            {/* data for each row */}
            {data.map((row, index) => (
                <div key={index} className="resource-row">
                    <div className="column">{row.sNo}</div>
                    <div className="column">{row.name}</div>
                    <div className="column">{row.materials}</div>
                    <div className="column">{row.facilities}</div>
                    <div className={`column status-${row.status.color}`}>{row.status.text}</div>
                    <div className="column">{row.dueDate}</div>
                    <div className="column action-column">
                        <button className="view-details">View Details</button>
                    </div>
                </div>
            ))}

            <div className="tick-box">
                <label className="tick-label">
                    <input type="checkbox" id="tickAll" />
                    Tick off All Selected Items
                </label>
            </div>
        </div>
    );
};

export default Resources;
