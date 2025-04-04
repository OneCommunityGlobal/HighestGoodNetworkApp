import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

function InteractiveMap() {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tags, setTags] = useState([]); // For testing with tags like LessonForm

    // Define custom icons for different org statuses
    const activeIcon = new Icon({
        iconUrl: markerIconPng,
        shadowUrl: markerShadowPng,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'active-marker'
    });

    // Test fetching tags like LessonForm does
    const fetchTags = async () => {
        try {
            console.log("Attempting to fetch tags from:", ENDPOINTS.BM_TAGS);
            const response = await axios.get(ENDPOINTS.BM_TAGS);
            console.log("Tags response:", response);
            setTags(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching tags: ', error.message);
            return [];
        }
    };

    // Test fetching orgs like LessonForm does
    const fetchOrgs = async () => {
        try {
            console.log("Attempting to fetch orgs from:", ENDPOINTS.BM_ORGS_WITH_LOCATION);
            const response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
            console.log("orgs response:", response);
            setOrgs(response.data.data || []);
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching orgs: ', error.message);
            return [];
        }
    };

    useEffect(() => {
        // First try to fetch tags and orgs to see if those endpoints work
        const testEndpoints = async () => {
            console.log("Testing endpoints that work in LessonForm...");
            
            // Test tags endpoint
            const tagsResult = await fetchTags();
            console.log("Tags fetch result:", tagsResult);
            
            // Test orgs endpoint
            const orgsResult = await fetchOrgs();
            console.log("Orgs fetch result:", orgsResult);
            
        };
        
        testEndpoints();
    }, []);

    return (
        <div>
            <h1>Global Distribution and Org Status Overview</h1>
            
            {loading && <p>Loading org data...</p>}
            {error && <p className="error-message">{error}</p>}
            
            <button onClick={fetchTags}>Test Tags Endpoint</button>
            <button onClick={fetchOrgs}>Test Orgs Endpoint</button>
            
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
                    
                    {!loading && orgs.length > 0 && orgs.map((org, index) => (
                        <Marker 
                            key={org.orgId || index}
                            position={[org.latitude, org.longitude]}
                            icon={activeIcon}
                        >
                            <Popup>
                                <div>
                                    <h3>{org.name}</h3>
                                    <p>Org ID: {org.orgId}</p>
                                    <p>Status: {org.status}</p>
                                    <button onClick={() => console.log('Clicked on org:', org)}>
                                        View Details
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            
            <div className="debug-section" style={{ marginTop: '20px' }}>
                <h3>Debug: Org Data ({orgs.length} orgs)</h3>
                <pre>{JSON.stringify(orgs, null, 2)}</pre>
                
                <h3>Debug: Tags Data ({tags.length} tags)</h3>
                <pre>{JSON.stringify(tags, null, 2)}</pre>
                
                <h3>Debug: Orgs Data ({orgs.length} orgs)</h3>
                <pre>{JSON.stringify(orgs, null, 2)}</pre>
            </div>
        </div>
    );
}

export default InteractiveMap;
