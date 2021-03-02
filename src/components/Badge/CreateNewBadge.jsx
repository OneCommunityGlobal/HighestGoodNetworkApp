import React, { useState, useEffect } from 'react';
import {
  Button, Form, FormGroup, Label, Input, FormText, FormFeedback, Alert
} from 'reactstrap';
import { connect } from 'react-redux';
import { fetchAllProjects } from '../../actions/projects';
import { createNewBadge, closeAlert } from '../../actions/badgeManagement';

const CreateNewBadge = (props) => {

  const [badgeName, setBadgeName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Unspecified');
  const [projectName, setProjectName] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [ranking, setRanking] = useState(0);

  useEffect(() => {
    props.fetchAllProjects();
  }, []);

  const enableButton = badgeName.length === 0 || imageUrl.length === 0 || description.length === 0

  const handleChange = (event) => {
    switch (event.target.id) {
      case 'badgeName':
        setBadgeName(event.target.value);
        break;
      case 'imageUrl':
        setImageUrl(event.target.value);
        break;
      case 'badgeDescription':
        setDescription(event.target.value);
        break;
      case 'category':
        if (category === '--- Unspecified ---') {
          setCategory('Unspecified');
        } else {
          setCategory(event.target.value);
        }
        break;
      case 'project':
        setProjectName(event.target.value);
        if (projectName === '--- Unspecified ---') {
          setProjectId(null);
        } else {
          const selectedIndex = event.target.options.selectedIndex;
          const projectId = event.target.options[selectedIndex].getAttribute('project-id');
          setProjectId(projectId);
        }
        break;
      case 'badgeRanking':
        setRanking(Number(event.target.value));
        break;
      default:
        return;
    }
  }


  const handleSubmit = () => {
    const newBadge = {
      badgeName: badgeName,
      imageUrl: imageUrl,
      category: category,
      project: projectId,
      ranking: ranking,
      description: description,
    }
    props.createNewBadge(newBadge);
  }

  return (
    <Form>
      <FormGroup>
        <Label for="badgeName">Name</Label>
        <Input type="name" name="name" id="badgeName" value={badgeName} onChange={handleChange} placeholder="Badge Name" invalid={badgeName.length === 0} />
        <FormFeedback>Badge name is required and must be unique.</FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label for="imageUrl">Image URL</Label>
        <Input type="url" name="url" id="imageUrl" value={imageUrl} onChange={handleChange} placeholder="Image Url" invalid={imageUrl.length === 0} />
        <FormText color="muted">
          For Dropbox URL that ends with "dl=0", please replace with "raw=1".
        </FormText>
      </FormGroup>
      <FormGroup>
        <Label for="badgeDescription">Description</Label>
        <Input type="textarea" name="text" id="badgeDescription" value={description} onChange={handleChange} invalid={description.length === 0} />
      </FormGroup>
      <FormGroup>
        <Label for="category">Category</Label>
        <Input type="select" name="selectCategory" id="category" value={category} onChange={handleChange}>
          <option>--- Unspecified ---</option>
          <option>Food</option>
          <option>Energy</option>
          <option>Housing</option>
          <option>Education</option>
          <option>Society</option>
          <option>Economics</option>
          <option>Stewardship</option>
          <option>Other</option>
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="project">Project</Label>
        <Input type="select" name="selectProject" id="project" value={projectName} onChange={handleChange}>
          <option>--- Unspecified ---</option>
          {props.allProjects.map((project) => <option key={project._id} project-id={project._id} >{project.projectName}</option>)}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="badgeRanking">Ranking</Label>
        <Input type="number" min={0} name="ranking" id="badgeRanking" value={ranking} onChange={handleChange} placeholder="Please Enter a Number" />
      </FormGroup>
      <Button color="info" onClick={handleSubmit} disabled={enableButton}>Create</Button>
    </Form>
  );
};

const mapStateToProps = state => ({
  allProjects: state.allProjects.projects,
  message: state.badge.message,
  alertVisible: state.badge.alertVisible,
  color: state.badge.color
});

const mapDispatchToProps = dispatch => ({
  fetchAllProjects: () => dispatch(fetchAllProjects()),
  createNewBadge: (newBadge) => dispatch(createNewBadge(newBadge)),
  closeAlert: () => dispatch(closeAlert())
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewBadge);
