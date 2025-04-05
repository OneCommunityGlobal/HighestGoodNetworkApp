import React, { useState } from "react";

const ResourceMonitoring = () => {
    const resources = [
        { title: "Resource Issue", value: 27, max: 80, change: "+14%", direction: "up", bgColor: "#fdecea" },
        { title: "Resource Usage", value: 56, max: 80, change: "-24%", direction: "down", bgColor: "#eafaf1" },
        { title: "Event Numbers Left", value: 100, max: 200, change: "+5%", direction: "up", bgColor: "#fff8e6" },
        { title: "Attendance", value: 75, max: 100, change: "-8%", direction: "down", bgColor: "#e7f4fc" },
        { title: "New Members", value: 20, max: 50, change: "+10%", direction: "up", bgColor: "#f3e8fd" },
    ];

    const [clickedArrow, setClickedArrow] = useState(null);

    const handleArrowClick = (index) => {
        setClickedArrow(index === clickedArrow ? null : index); 
    };

    return (
        <div className="resourceMonitoring">
            <h2>Resources Monitoring</h2>
            <div className="resourceGrid">
                {resources.map((resource, index) => {
                    const progress = (resource.value / resource.max) * 100;
                    const arrowColor = resource.direction === "up" ? "green" : "red";

                    return (
                        <div
                            className="resourceCard"
                            key={index}
                            style={{
                                backgroundColor: resource.bgColor,
                                padding: "15px",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            {/* Left Section: Title and Value */}
                            <div style={{ textAlign: "left" }}>
                                <div className="resource-title" style={{ fontSize: "1rem", fontWeight: "500" }}>
                                    {resource.title}
                                    <span
                                        style={{ fontSize: "0.8rem", cursor: "pointer", marginLeft: "5px" }} 
                                        onClick={() => handleArrowClick(index)} 
                                    >
                                        ↗
                                    </span>
                                </div>
                                <div
                                    className="resource-value"
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: "2rem",
                                        color: "black",
                                        marginTop: "10px",
                                    }}
                                >
                                    {resource.value}
                                </div>
                                <div
                                    className="resource-stats"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginTop: "5px",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    <div
                                        className="arrow"
                                        style={{
                                            color: arrowColor,
                                            fontSize: "1rem",
                                            marginRight: "5px",
                                        }}
                                    >
                                        {resource.direction === "up" ? "▲" : "▼"}
                                    </div>
                                    <p style={{ margin: "0 5px", color: arrowColor }}>{resource.change}</p>
                                    <p style={{ color: "grey" }}>compare to last week</p>
                                </div>
                            </div>

                            {/* Right Section: Circle */}
                            <div className="circle-container" style={{ textAlign: "right" }}>
                                <svg
                                    className="progress-circle"
                                    viewBox="0 0 36 36"
                                    style={{
                                        width: "90px", 
                                        height: "90px", 
                                    }}
                                >
                                    <path
                                        className="circle-bg"
                                        style={{ stroke: "lightgrey", fill: "none", strokeWidth: "2" }}
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="circle-progress"
                                        style={{
                                            stroke:
                                                resource.title === "Resource Issue"
                                                    ? "red"
                                                    : resource.title === "Resource Usage"
                                                    ? "green"
                                                    : resource.title === "Event Numbers Left"
                                                    ? "goldenrod"
                                                    : resource.title === "Attendance"
                                                    ? "blue"
                                                    : "purple", 
                                            fill: "none",
                                            strokeWidth: "2",
                                        }}
                                        strokeDasharray={`${progress}, 100`}
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div
                                    className="circle-label"
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: "bold",
                                        color: "black",
                                        marginTop: "5px",
                                    }}
                                >
                                    {resource.title === "Attendance"
                                        ? "Healthy"
                                        : resource.title === "New Members"
                                        ? "Good"
                                        : `${resource.value}/${resource.max}`}
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResourceMonitoring;
