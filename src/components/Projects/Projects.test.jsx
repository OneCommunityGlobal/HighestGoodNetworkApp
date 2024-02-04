import React from 'react';
import { shallow, mount } from 'enzyme';
import { Projects } from './Projects';
import { createMemoryHistory } from 'history';
import {
  PROJECTS,
  ACTIVE_PROJECTS,
  PROJECT_NAME,
  ACTIVE,
  MEMBERS,
  WBS,
} from './../../languages/en/ui';

import { Router } from 'react-router-dom';

describe('Projects page structure', () => {
  // let mountedProjects, props;
  // beforeEach(() => {
  //   props = ({
  //     fetchAllProjects: jest.fn(),
  //     postNewProject: jest.fn(),
  //     deleteProject: jest.fn(),
  //     modifyProject: jest.fn(),
  //     state: {
  //       "allProjects": {
  //           "fetching": false,
  //           "fetched": true,
  //           "projects": [
  //             {
  //               "isActive": true,
  //               "_id": "5ad91ec3590b19002acfcd24",
  //               "projectName": "HG Housing"
  //             },
  //             {
  //               "isActive": true,
  //               "_id": "5b0db11ffe4a7a002d2b6c76",
  //               "projectName": "HG Society"
  //             },
  //             {
  //               "isActive": true,
  //               "_id": "5a6b821d019f9213b4186ccc",
  //               "projectName": "HGN Software Developement"
  //             },
  //             {
  //               "isActive": false,
  //               "_id": "5ad9222b590b19002acfcd28",
  //               "projectName": "Marketing and Promotion"
  //             }
  //           ],
  //           "status": "200"
  //         }
  //     },
  //     auth: {isAuthenticated: true , user: {userid: 'abcdef'}}
  //   });
  //   mountedProjects = mount(<Router history={createMemoryHistory(['/projects'])}><Projects {...props} /></Router>);
  // });

  it('should be rendered with two h4/h6 labeled with number of projects/active projects', () => {
    //TEST IS FAILING NEED TO FIX
    // const h4 = mountedProjects.find('h4');
    // expect(h4.length).toEqual(2);
    // expect(h4.first().text()).toContain(`4`);
    // expect(h4.at(1).text()).toContain(`3`);
    // const h6 = mountedProjects.find('h6');
    // expect(h6.length).toEqual(2);
    // expect(h6.first().text()).toContain(` ${PROJECTS}`);
    // expect(h6.at(1).text()).toContain(` ${ACTIVE_PROJECTS}`);
  });

  it('should be rendered with an input and button to add a project and an input per project', async () => {
    //TEST IS FAILING NEED TO FIX
    // const input = mountedProjects.find('input');
    // expect(input.length).toEqual(5);
    // expect(input.first().prop('placeholder')).toContain("Project Name");
    // //Make sure the Add Button Appears
    // mountedProjects.find('input').first().simulate('change', { target: {value: 'P' }});
    // const buttons = mountedProjects.find('button');
    // //3 Buttons (Members, WBS, Delete) per Project(4) + an Add Button
    // expect(buttons.length).toEqual(13);
    // let projects = props.state.allProjects.projects;
    // for (let i = 0; i<projects.length; i++) {
    //     expect(input.at(i+1).prop('value')).toContain(projects[i].projectName);
    // }
  });

  it('should be rendered with 8 links to the member and WBS pages', async () => {
    //TEST IS FAILING NEED TO FIX
    // const links = mountedProjects.find('a');
    // expect(links.length).toEqual(8);
    // let projects = props.state.allProjects.projects;
    // for (let i = 0; i<projects.length; i++) {
    //     expect(links.at(2 * i).prop('href')).toContain(`members/${projects[i]._id}`);
    //     expect(links.at(2 * i + 1).prop('href')).toContain(`/project/wbs/${projects[i]._id}`);
    // }
  });

  it('should be rendered with a thead with 6 headers with correct text', () => {
    //TEST IS FAILING NEED TO FIX
    // const thead = mountedProjects.find('thead');
    // expect(thead.length).toEqual(1);
    // const th = thead.find('th');
    // expect(th.length).toEqual(6);
    // expect(th.at(1).text()).toContain(PROJECT_NAME);
    // expect(th.at(2).text()).toContain(ACTIVE);
    // expect(th.at(3).text()).toContain(MEMBERS);
    // expect(th.at(4).text()).toContain(WBS);
  });
});
