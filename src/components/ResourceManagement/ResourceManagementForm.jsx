/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';

const ResourceManagementForm = () => {
  const [user, setUser] = useState('');
  const [duration, setDuration] = useState('');
  const [facilities, setFacilities] = useState('');
  const [materials, setMaterials] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();

    const resource = { user, duration, facilities, materials, date };
    const response = await fetch('/api/resourceManagement', {
      method: 'POST',
      body: JSON.stringify(resource),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
    }
    if (response.ok) {
      setError(null);
      setUser('');
      setDuration('');
      setFacilities('');
      setMaterials('');
      setDate('');
      console.log('new form added:', json);
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <label>Name of User</label>
      <input type="text" onChange={e => setUser(e.target.value)} value={user} />

      <label>Duration</label>
      <input type="text" onChange={e => setDuration(e.target.value)} value={duration} />

      <label>Facilities</label>
      <input type="text" onChange={e => setFacilities(e.target.value)} value={facilities} />

      <label>Materials</label>
      <input type="text" onChange={e => setMaterials(e.target.value)} value={materials} />

      <label>Date</label>
      <input type="text" onChange={e => setDate(e.target.value)} value={date} />

      <button>Add New Log</button>

      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default ResourceManagementForm;
