import { useState } from 'react';
import { FormControl } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { useUserSearch } from './useUserSearch';

function UserSearch({ addedUsers, onAddUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [show, setShow] = useState(false);

  const { users: results, loading, error } = useUserSearch(searchTerm);

  const handleInputChange = (value) => {
    setSearchTerm(value);
  };

  const isSelected = (id) => addedUsers.find(user => user.userID === id);

  return (
    <div
      style={{ position: 'relative', width: '250px' }}
      tabIndex={-1}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <FormControl
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(event)=>handleInputChange(event.target.value)}
      />

      {show && (
        <ListGroup
          style={{
            position: 'absolute',
            top: '100%',
            width: '100%',
            zIndex: 2000,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {loading && (
            <ListGroup.Item disabled>Loading...</ListGroup.Item>
          )}

          {error && (
            <ListGroup.Item disabled style={{ color: 'red' }}>
              {error.message}
            </ListGroup.Item>
          )}

          {!loading && results.length === 0 && searchTerm.trim().length > 1 && (
            <ListGroup.Item disabled>No users found</ListGroup.Item>
          )}
          {results.map(({ firstName, lastName, _id }) => {
            const selected = isSelected(_id);

            return (
              <ListGroup.Item
                action
                key={`user-${_id}`}
                disabled={selected}
                onMouseDown={() => {
                  if (!selected) {
                    onAddUser(_id, firstName, lastName);
                    if(firstName.includes(searchTerm) || lastName.includes(searchTerm)){
                      handleInputChange('')
                    }
                  }
                }}
                style={{
                  backgroundColor: selected ? '#f8f9fa' : undefined,
                  color: selected ? '#6c757d' : undefined,
                  cursor: selected ? 'not-allowed' : 'pointer',
                }}
              >
                {`${firstName} ${lastName}`}
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      )}
    </div>
  );
}

export default UserSearch;
