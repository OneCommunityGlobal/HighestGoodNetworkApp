/* eslint-disable */
import React, { useState } from 'react';
import { Form, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddLessons() {
  const defaultProject = 'Building 1';
  const [content, setContent] = useState('');
  const [project, setProject] = useState(defaultProject);
  const [tags, setTags] = useState([defaultProject]);
  const [tagInput, setTagInput] = useState('');
  const [viewBy, setViewBy] = useState('All');
  const [file, setFile] = useState(null);

  const handleTagKeyPress = e => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleFileChange = e => {
    setFile(e);
  };

  const handleSubmit = () => {
    let count = 0;
    if (!content.trim()) {
      toast.error('Please write a lesson');
      count += 1;
    }
    if (tags.length === 0) {
      toast.error('Please enter a tag');
      count += 1;
    }
    if (count === 0) {
      const lessonData = {
        content,
        tags: [...tags],
        project,
        viewBy,
        file,
      };
      console.log('lesson posted');
      console.log(lessonData);
      toast.success('Lesson submitted successfully!');
      handleReset();
    }
  };

  const handleReset = () => {
    setContent('');
    setProject(defaultProject);
    setTags([defaultProject]);
    setViewBy('All');
    setFile(null);
  };

  const handleProjectChange = newProject => {
    setProject(newProject);
    // Remove all building tags
    const buildingTags = [
      'Building 1',
      'Building 2',
      'Building 3',
      'Commercial Test - Project',
      'Residential Test - Project',
    ];
    const filteredTags = tags.filter(tag => !buildingTags.includes(tag));
    // Add the selected project
    if (!filteredTags.includes(newProject)) {
      filteredTags.push(newProject);
    }
    setTags(filteredTags);
  };

  return (
    <div
      className="p-4"
      style={{
        maxWidth: '600px',
        margin: 'auto',
        background: '#f7f9fc',
        borderRadius: '10px',
      }}
    >
      <h5 className="mb-4">Write a Lesson</h5>

      <Form.Group controlId="lessonContent" className="mb-3">
        <Form.Control
          as="textarea"
          rows={5}
          placeholder="Enter the lesson you learn..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="tagInput" className="mb-3">
        <Form.Label>Add Tag</Form.Label>
        <Form.Control
          type="text"
          placeholder="Input tag for the lesson"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyPress}
        />
        <div className="mt-2 d-flex flex-wrap">
          {tags.map(tag => (
            <span
              key={tag}
              className="badge bg-secondary me-2 mb-2"
              style={{
                padding: '6px 10px',
                fontSize: '0.85rem',
                borderRadius: '12px',
                display: 'inline-block',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <div className="d-flex justify-content-between align-items-end">
          <div style={{ flex: 1 }}>
            <Form.Label className="ms-1">Belongs to</Form.Label>
            <DropdownButton
              variant="outline-secondary"
              title={project}
              onSelect={handleProjectChange}
              className="w-100"
            >
              <Dropdown.Item eventKey="Building 1">Building 1</Dropdown.Item>
              <Dropdown.Item eventKey="Building 2">Building 2</Dropdown.Item>
              <Dropdown.Item eventKey="Building 3">Building 3</Dropdown.Item>
              <Dropdown.Item eventKey="Commercial Test - Project">
                Commercial Test - Project
              </Dropdown.Item>
              <Dropdown.Item eventKey="Residential Test - Project">
                Residential Test - Project
              </Dropdown.Item>
            </DropdownButton>
          </div>

          <div style={{ flex: 1 }}>
            <Form.Label className="ms-1">View by</Form.Label>
            <DropdownButton
              variant="outline-secondary"
              title={viewBy}
              onSelect={val => setViewBy(val)}
              className="w-100"
            >
              <Dropdown.Item eventKey="All">All</Dropdown.Item>
              <Dropdown.Item eventKey="Owner">Owner</Dropdown.Item>
              <Dropdown.Item eventKey="Admin">Admin</Dropdown.Item>
              <Dropdown.Item eventKey="Volunteer">Volunteer</Dropdown.Item>
            </DropdownButton>
          </div>
        </div>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Upload Appendix</Form.Label>
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
          }}
          style={{
            border: '2px dashed #6c757d',
            borderRadius: '10px',
            padding: '30px',
            textAlign: 'center',
            color: '#6c757d',
            backgroundColor: '#f8f9fa',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('fileInput').click()}
        >
          {file ? (
            <div>
              <strong>Selected:</strong> {file.name}
            </div>
          ) : (
            'Drag and drop a file here, or click to browse'
          )}
          <input
            type="file"
            id="fileInput"
            onChange={e => handleFileChange(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={handleReset}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Post
        </Button>
      </div>
    </div>
  );
}

export default AddLessons;
