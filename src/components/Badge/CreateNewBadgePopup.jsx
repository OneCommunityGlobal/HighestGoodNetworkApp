import React, { useState, useEffect } from 'react';
import {
  Button, Form, FormGroup, Label, Input, FormText, FormFeedback, UncontrolledTooltip
} from 'reactstrap';
import { connect } from 'react-redux';
import { fetchAllProjects } from '../../actions/projects';
import { createNewBadge, closeAlert } from '../../actions/badgeManagement';

const CreateNewBadgePopup = (props) => {

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


  const validRanking = (ranking) => {
    const pattern = /^[0-9]*$/;
    return pattern.test(ranking);
  }

  const enableButton = badgeName.length === 0 || imageUrl.length === 0 || description.length === 0 || !validRanking(ranking);

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
        const selectedCategoryValue = event.target.value;
        if (selectedCategoryValue.length === 0) {
          setCategory('Unspecified');
        } else {
          setCategory(selectedCategoryValue);
        }
        break;
      case 'project':
        const selectedProjectName = event.target.value;
        setProjectName(selectedProjectName);
        if (selectedProjectName.length === 0) {
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
        <Input type="url" name="url" id="imageUrl" value={imageUrl} onChange={handleChange} placeholder="Image URL" invalid={imageUrl.length === 0} />
        <FormText color="muted">
          For Dropbox URL that ends with "dl=0", please replace with "raw=1".
        </FormText>
      </FormGroup>
      <FormGroup>
        <Label for="badgeDescription">Description</Label>
        <Input type="textarea" name="text" id="badgeDescription" value={description} onChange={handleChange} invalid={description.length === 0} />
      </FormGroup>
      <FormGroup>
        <Label for="category">Category  </Label>
        <i className="fa fa-info-circle" id="CategoryInfo" style={{ marginLeft: '5px' }} />
        <UncontrolledTooltip placement="right" target="CategoryInfo" style={{ backgroundColor: '#666', color: '#fff' }} >
          <p className="badge_info_icon_text">Choosing a category is optional but generally the best thing to do. If no category is chosen, the category will automatically be marked as "unspecified", the least cool option of all.</p>
        </UncontrolledTooltip>
        <Input type="select" name="selectCategory" id="category" value={category} onChange={handleChange}>
          <option value={''}>{''}</option>
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
        <i class="fa fa-info-circle" id="ProjectInfo" style={{ marginLeft: '5px' }} />
        <UncontrolledTooltip placement="right" target="ProjectInfo" style={{ backgroundColor: '#666', color: '#fff' }}>
          <p className="badge_info_icon_text">{'Choosing a project is optional. If no project is specified <gasp!>, the project field will be left <surprise!> empty. So ya, not really a big deal. Assigning projects to different groups of badges is another way to sort and find them using the filter tool though, so there is that.'}</p>
        </UncontrolledTooltip>
        <Input type="select" name="selectProject" id="project" value={projectName} onChange={handleChange}>
          <option value={''}>{''}</option>
          {props.allProjects.map((project) => <option key={project._id} project-id={project._id} >{project.projectName}</option>)}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="badgeRanking">Ranking </Label>
        <i className="fa fa-info-circle" id="RankingInfo" style={{ marginLeft: '5px' }} />
        <UncontrolledTooltip placement="right" target="RankingInfo" style={{ backgroundColor: '#666', color: '#fff' }}>
          <p className="badge_info_icon_text">Ranking number MUST be non-negative and whole number. Seriously, how could anything be ranked -1.1? Also, the default value is "0", which would be the lowest rank, 1 though is the highest rank. Confused yet?</p>
          <p className="badge_info_icon_text">Good news is, everything else is really simple! The lower the number (other than zero) the higher the badge ranking and the higher a badge will show up on a person's dashboard. Want to see a badge at the top of someone's list, make it #1!</p>
          <p className="badge_info_icon_text">All badges of the same number in ranking sort alphabetically by their names.</p>
        </UncontrolledTooltip>
        <Input type="number" min={0} valid={validRanking(ranking)} invalid={!validRanking(ranking)} name="ranking" id="badgeRanking" value={ranking} onChange={handleChange} placeholder="Please Enter a Number" />
      </FormGroup>
      <Button color="info" onClick={handleSubmit} disabled={enableButton}>Create</Button>
    </Form >
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewBadgePopup);
