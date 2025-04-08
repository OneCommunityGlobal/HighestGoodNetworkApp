import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
function InteractiveMap() {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);

    // status color: active, delayed, completed
    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'active':
                return '#FF0000';
            case 'delayed':
                return '#0000FF';
            case 'completed':
                return '#FFFF00';
        }
    };

    // fetch orgs 
    const fetchOrgs = async () => {
        try {
            const response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
            setOrgs(response.data.data || []);
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching orgs: ', error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    return (
        <div>
            <h1>Global Distribution and Org Status Overview</h1>
            
            {/* Status Legend */}
            <div style={{ display: 'flex', gap: '15px', margin: '10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: '#FF0000', 
                        marginRight: '5px' 
                    }}></div>
                    <span>Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: '#0000FF', 
                        marginRight: '5px' 
                    }}></div>
                    <span>Delayed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: '#FFFF00', 
                        marginRight: '5px' 
                    }}></div>
                    <span>Completed</span>
                </div>
            </div>
            
            <div style={{ height: '500px', width: '100%' }}>
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {orgs.map((org, index) => (
                        <CircleMarker
                            key={org.orgId || index}
                            center={[org.latitude, org.longitude]}
                            radius={8}
                            pathOptions={{
                                fillColor: getStatusColor(org.status),
                                fillOpacity: 0.8,
                                color: 'white',
                                weight: 1
                            }}
                        >
                            <Popup>
                                <div>
                                    <h3>{org.name}</h3>
                                    <p>Org ID: {org.orgId}</p>
                                    <p>Status: {org.status}</p>
                                    <p>Country: {org.country}</p>
                                    <button 
                                        onClick={() => console.log('Clicked on org:', org)}
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            padding: '5px 10px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
            
            <div className="debug-section" style={{ marginTop: '20px' }}>
                <h3>Debug: Orgs Data ({orgs.length} orgs)</h3>
                <pre>{JSON.stringify(orgs, null, 2)}</pre>
            </div>
        </div>
    );
}

export default InteractiveMap;
