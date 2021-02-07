import React from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

const CreateNewBadge = () => {
  return (
    <Form>
      <FormGroup>
        <Label for="badgeName">Name</Label>
        <Input type="name" name="name" id="badgeName" placeholder="Badge Name" />
      </FormGroup>
      <FormGroup>
        <Label for="imageUrl">Image URL</Label>
        <Input type="url" name="url" id="imageUrl" placeholder="Image Url" />
        <FormText color="muted">
          For Dropbox URL that ends with "dl=0", please replace with "raw=0".
        </FormText>
      </FormGroup>
      <FormGroup>
        <Label for="badgeDescription">Description</Label>
        <Input type="textarea" name="text" id="badgeDescription" />
      </FormGroup>
      <FormGroup>
        <Label for="category">Category</Label>
        <Input type="select" name="selectCategory" id="category">
          <option>Education</option>
          <option>Infrastructure</option>
          <option>Marketing & Promotion</option>
          <option>Interviews & Hospitality</option>
          <option>Funding & Partnership Building</option>
          <option>Other</option>
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="project">Project</Label>
        <Input type="select" name="selectProject" id="category">
          <option>HG Education</option>
          <option>Duplicable City Center</option>
          <option>HGN Software Developement</option>
          <option>Earthbag Village</option>
          <option>HG Housing</option>
          <option>HG Food</option>
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="badgeRanking">Ranking</Label>
        <Input type="number" name="ranking" id="badgeRanking" placeholder="Please Enter a Number" />
      </FormGroup>
      <Button color="info">Create</Button>
    </Form>
  );
}

export default CreateNewBadge;