import {render,screen} from '@testing-library/react';
import UserLinks from '../UserLinks.jsx';
import { BrowserRouter as Router } from 'react-router-dom';

let links=[];

function renderComponent(props)
{
  render (
    <Router>
      <UserLinks links={props}/>
     </Router>);
}

describe("Test suite for UserLinks components ",()=>{
 
  it("Test case 1 : Component renders without crashing ",()=>{
    renderComponent (links);
    const userLinkContainer= screen.getByTestId("testLinkContainer");
    expect(userLinkContainer).toBeInTheDocument();

  });
  it("Test case 2: Assert if the link name is not rendered when  empty string is passed ",()=>{
    links=[{Link:'',name: ''}];
    renderComponent (links);
    const userLinkContainer= screen.getByTestId("testLinkContainer");
    expect(userLinkContainer).toBeInTheDocument();
    const linkObject=screen.queryByTestId("testLink");
    expect(linkObject).not.toBeInTheDocument();
    const hyperLinkObj=screen.queryByTestId("testHyperLink");
    expect(hyperLinkObj).not.toBeInTheDocument();
  });
  it("Test case 3: Assert if the link name is rendered  for a valid external link " , ()=>
  {
    links=[{Link:'https',Name: 'Test'}];
    renderComponent (links);
    const hyperLinkObj=screen.getByTestId("testHyperLink");
    expect(hyperLinkObj).toBeInTheDocument();

    let linkObj=screen.queryByTestId("testLink");
    expect(linkObj).not.toBeInTheDocument();
   

  });
  it("Test case 4: Assert if the link name is not rendered  for an invalid external link " , ()=>
  {
    // Test Data 1
    links=[{Link:'', Name: 'Test'}];
    renderComponent (links);
    let hyperLinkObj=screen.queryByTestId("testHyperLink");
    expect(hyperLinkObj).not.toBeInTheDocument();


    //Test Data 2
    links=[{Link:'externalLink', Name: 'Test'}];
    renderComponent (links);
    hyperLinkObj=screen.queryByTestId("testHyperLink");
    expect(hyperLinkObj).not.toBeInTheDocument();

     //Test Data 3
     links=[{Link:'htt://externalLink.com', Name: 'Test'}];
     renderComponent (links);
     hyperLinkObj=screen.queryByTestId("testHyperLink");
     expect(hyperLinkObj).not.toBeInTheDocument();

  });
  it("Test Case 5 : Assert if link is rendered for a valid internal link ",()=>{
    links=[{Link:'internalLink', Name: 'Test'}];
    renderComponent (links);
    const linkObj=screen.getByTestId("testLink");
    expect(linkObj).toBeInTheDocument();

  });

  it("Test Case 6 : Assert if link is not rendered for an  empty internal link ",()=>{
    links=[{Link:'', Name: 'Test'}];
    renderComponent (links);
    const linkObj=screen.queryByTestId("testLink");
    expect(linkObj).not.toBeInTheDocument();

  });

  it("Test Case 7: Assert if both the internal & extenal link Name is displayed in upper case",()=>{
    // external link validation 
    links=[{Link:'http://sampleTest.com', Name: 'externallink'}];
    renderComponent (links);
    let hyperLinkObj=screen.getByText("EXTERNALLINK");
    expect(hyperLinkObj).toBeInTheDocument();
    hyperLinkObj=screen.queryByText(links[0].Name);
    expect(hyperLinkObj).not.toBeInTheDocument();

    // internal link validation 
    links=[{Link:'sampleTest.com', Name: 'internallink'}];
    renderComponent (links);
    let linkObj=screen.getByText("INTERNALLINK");
    expect(linkObj).toBeInTheDocument();
    linkObj=screen.queryByText(links[0].Name);
    expect(linkObj).not.toBeInTheDocument();

  });

  it("Test Case 8 : Assert if the component is able to render multiple links for a user ",()=>{
  links=[{Link:'internalLink', Name: 'InternalLink'},{Link:'http://externalLink.com',Name:'ExternalLink'}];
  renderComponent (links);
  const linkObj=screen.getByText(links[0].Name.toUpperCase());
  expect(linkObj).toBeInTheDocument();
  const hyperLinkObj=screen.getByText(links[1].Name.toUpperCase());
  expect(hyperLinkObj).toBeInTheDocument();

  });

});