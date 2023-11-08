import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { connect } from 'react-redux';
import ProjectsList from './Projects/ProjectsList';
import ProjectSelectForm from './Projects/ProjectSelectForm';
import './BMDashboard.css';

// data for project details

// const dummyProjects = [
//   {
//     projectId: 1,
//     projectName: 'Big project',
//     tools: [
//       {
//         inventoryItemId: 1,
//         title: 'forklift',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '200',
//       },
//       {
//         inventoryItemId: 2,
//         title: 'saw',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '200',
//       },
//     ],
//     materials: [
//       {
//         inventoryItemId: 3,
//         title: 'soil mix',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '80lb',
//         cost: '200',
//       },
//       {
//         inventoryItemId: 4,
//         title: '1/2" pea gravel',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '95lb',
//         cost: '200',
//       },
//     ],
//     people: [
//       {
//         personId: 1,
//         personName: 'Dora',
//         personLastName: 'Kimberly',
//         role: 'Carpenter',
//         team: 'XYZ',
//         currentTask: 'Stud wall construction',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//       {
//         personId: 2,
//         personName: 'Cailin',
//         personLastName: 'Colby',
//         role: 'Volunteer',
//         team: 'ABC',
//         currentTask: 'Foundation concreting',
//         totalHrs: 15,
//         todayHrs: 5,
//       },
//       {
//         personId: 3,
//         personName: 'John',
//         personLastName: 'Smith',
//         role: 'Role A',
//         team: 'XYZ',
//         currentTask: 'Task 1',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//     ],
//   },
//   {
//     projectId: 2,
//     projectName: 'Bigger project',
//     tools: [
//       {
//         inventoryItemId: 1,
//         title: 'forklift',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//       },
//       {
//         inventoryItemId: 2,
//         title: 'saw',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//       },
//     ],
//     materials: [
//       {
//         inventoryItemId: 3,
//         title: 'soil mix',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '80lb',
//       },
//       {
//         inventoryItemId: 4,
//         title: '1/2" pea gravel',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '95lb',
//       },
//     ],
//     people: [
//       {
//         personId: 1,
//         personName: 'Dora',
//         personLastName: 'Kimberly',
//         role: 'Carpenter',
//         team: 'XYZ',
//         currentTask: 'Stud wall construction',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//       {
//         personId: 2,
//         personName: 'Cailin',
//         personLastName: 'Colby',
//         role: 'Volunteer',
//         team: 'ABC',
//         currentTask: 'Foundation concreting',
//         totalHrs: 15,
//         todayHrs: 5,
//       },
//       {
//         personId: 3,
//         personName: 'John',
//         personLastName: 'Smith',
//         role: 'Role A',
//         team: 'XYZ',
//         currentTask: 'Task 1',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//     ],
//   },
//   {
//     projectId: 3,
//     projectName: 'Important project',
//     tools: [
//       {
//         inventoryItemId: 1,
//         title: 'forklift',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//       },
//       {
//         inventoryItemId: 2,
//         title: 'saw',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//       },
//     ],
//     materials: [
//       {
//         inventoryItemId: 3,
//         title: 'soil mix',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '80lb',
//       },
//       {
//         inventoryItemId: 4,
//         title: '1/2" pea gravel',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '95lb',
//       },
//     ],
//     people: [
//       {
//         personId: 1,
//         personName: 'Dora',
//         personLastName: 'Kimberly',
//         role: 'Carpenter',
//         team: 'XYZ',
//         currentTask: 'Stud wall construction',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//       {
//         personId: 2,
//         personName: 'Cailin',
//         personLastName: 'Colby',
//         role: 'Volunteer',
//         team: 'ABC',
//         currentTask: 'Foundation concreting',
//         totalHrs: 15,
//         todayHrs: 5,
//       },
//       {
//         personId: 3,
//         personName: 'John',
//         personLastName: 'Smith',
//         role: 'Role A',
//         team: 'XYZ',
//         currentTask: 'Task 1',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//     ],
//   },
//   {
//     projectId: 4,
//     projectName: 'Very important project',
//     tools: [
//       {
//         inventoryItemId: 1,
//         title: 'forklift',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//       },
//       {
//         inventoryItemId: 2,
//         title: 'saw',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//       },
//     ],
//     materials: [
//       {
//         inventoryItemId: 3,
//         title: 'soil mix',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '80lb',
//       },
//       {
//         inventoryItemId: 4,
//         title: '1/2" pea gravel',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '95lb',
//       },
//     ],
//     people: [
//       {
//         personId: 1,
//         personName: 'Dora',
//         personLastName: 'Kimberly',
//         role: 'Carpenter',
//         team: 'XYZ',
//         currentTask: 'Stud wall construction',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//       {
//         personId: 2,
//         personName: 'Cailin',
//         personLastName: 'Colby',
//         role: 'Volunteer',
//         team: 'ABC',
//         currentTask: 'Foundation concreting',
//         totalHrs: 15,
//         todayHrs: 5,
//       },
//       {
//         personId: 3,
//         personName: 'John',
//         personLastName: 'Smith',
//         role: 'Role A',
//         team: 'XYZ',
//         currentTask: 'Task 1',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//     ],
//   },
// ];

// data for projects summary

// const dummyProjects = [
//   {
//     projectId: 1,
//     projectName: 'Big project',
//     tools: [
//       {
//         inventoryItemId: 1,
//         title: 'forklift',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '200',
//       },
//       {
//         inventoryItemId: 2,
//         title: 'saw',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '200',
//       },
//     ],
//     materials: [
//       {
//         inventoryItemId: 3,
//         title: 'soil mix',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '80lb',
//         cost: '200',
//         amountWasted: '10lb',
//       },
//       {
//         inventoryItemId: 4,
//         title: '1/2" pea gravel',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '95lb',
//         cost: '200',
//         amountWasted: '10lb',
//       },
//     ],
//     teams: [
//       {
//         teamId: 1,
//         name: 'ABC',
//       },
//       {
//         teamId: 2,
//         name: 'XYZ',
//       },
//     ],
//     people: [
//       {
//         personId: 1,
//         personName: 'Dora',
//         personLastName: 'Kimberly',
//         role: 'Carpenter',
//         team: 'XYZ',
//         currentTask: 'Stud wall construction',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//       {
//         personId: 2,
//         personName: 'Cailin',
//         personLastName: 'Colby',
//         role: 'Volunteer',
//         team: 'ABC',
//         currentTask: 'Foundation concreting',
//         totalHrs: 15,
//         todayHrs: 5,
//       },
//       {
//         personId: 3,
//         personName: 'John',
//         personLastName: 'Smith',
//         role: 'Role A',
//         team: 'XYZ',
//         currentTask: 'Task 1',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//     ],
//   },
//   {
//     projectId: 2,
//     projectName: 'Bigger project',
//     tools: [
//       {
//         inventoryItemId: 1,
//         title: 'forklift',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '110',
//       },
//       {
//         inventoryItemId: 2,
//         title: 'saw',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '100',
//       },
//       {
//         inventoryItemId: 3,
//         title: 'leafblower',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '200',
//       },
//     ],
//     materials: [
//       {
//         inventoryItemId: 3,
//         title: 'soil mix',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '80lb',
//         cost: '100',
//         amountWasted: '10lb',
//       },
//       {
//         inventoryItemId: 4,
//         title: '1/2" pea gravel',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '95lb',
//         cost: '200',
//         amountWasted: '10lb',
//       },
//     ],
//     teams: [
//       {
//         teamId: 1,
//         name: 'ABC',
//       },
//       {
//         teamId: 2,
//         name: 'XYZ',
//       },
//     ],
//     people: [
//       {
//         personId: 1,
//         personName: 'Dora',
//         personLastName: 'Kimberly',
//         role: 'Carpenter',
//         team: 'XYZ',
//         currentTask: 'Stud wall construction',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//       {
//         personId: 2,
//         personName: 'Cailin',
//         personLastName: 'Colby',
//         role: 'Volunteer',
//         team: 'ABC',
//         currentTask: 'Foundation concreting',
//         totalHrs: 15,
//         todayHrs: 5,
//       },
//       {
//         personId: 3,
//         personName: 'John',
//         personLastName: 'Smith',
//         role: 'Role A',
//         team: 'XYZ',
//         currentTask: 'Task 1',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//     ],
//   },
//   {
//     projectId: 3,
//     projectName: 'Important project',
//     tools: [
//       {
//         inventoryItemId: 1,
//         title: 'forklift',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '100',
//       },
//       {
//         inventoryItemId: 2,
//         title: 'saw',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '200',
//       },
//     ],
//     materials: [
//       {
//         inventoryItemId: 3,
//         title: 'soil mix',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '80lb',
//         cost: '100',
//         amountWasted: '10lb',
//       },
//       {
//         inventoryItemId: 4,
//         title: '1/2" pea gravel',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '95lb',
//         cost: '100',
//         amountWasted: '10lb',
//       },
//     ],
//     teams: [
//       {
//         teamId: 1,
//         name: 'ABC',
//       },
//       {
//         teamId: 2,
//         name: 'XYZ',
//       },
//     ],
//     people: [
//       {
//         personId: 1,
//         personName: 'Dora',
//         personLastName: 'Kimberly',
//         role: 'Carpenter',
//         team: 'XYZ',
//         currentTask: 'Stud wall construction',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//       {
//         personId: 2,
//         personName: 'Cailin',
//         personLastName: 'Colby',
//         role: 'Volunteer',
//         team: 'ABC',
//         currentTask: 'Foundation concreting',
//         totalHrs: 15,
//         todayHrs: 5,
//       },
//       {
//         personId: 3,
//         personName: 'John',
//         personLastName: 'Smith',
//         role: 'Role A',
//         team: 'XYZ',
//         currentTask: 'Task 1',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//     ],
//   },
//   {
//     projectId: 4,
//     projectName: 'Very important project',
//     tools: [
//       {
//         inventoryItemId: 1,
//         title: 'forklift',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '100',
//       },
//       {
//         inventoryItemId: 2,
//         title: 'saw',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         rentedOnDate: '',
//         rentDuration: '',
//         cost: '200',
//       },
//     ],
//     materials: [
//       {
//         inventoryItemId: 3,
//         title: 'soil mix',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '80lb',
//         cost: '100',
//         amountWasted: '10lb',
//       },
//       {
//         inventoryItemId: 4,
//         title: '1/2" pea gravel',
//         image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
//         amountTotal: '100lb',
//         amountUsed: '95lb',
//         cost: '200',
//         amountWasted: '10lb',
//       },
//     ],
//     teams: [
//       {
//         teamId: 1,
//         name: 'ABC',
//       },
//       {
//         teamId: 2,
//         name: 'XYZ',
//       },
//     ],
//     people: [
//       {
//         personId: 1,
//         personName: 'Dora',
//         personLastName: 'Kimberly',
//         role: 'Carpenter',
//         team: 'XYZ',
//         currentTask: 'Stud wall construction',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//       {
//         personId: 2,
//         personName: 'Cailin',
//         personLastName: 'Colby',
//         role: 'Volunteer',
//         team: 'ABC',
//         currentTask: 'Foundation concreting',
//         totalHrs: 15,
//         todayHrs: 5,
//       },
//       {
//         personId: 3,
//         personName: 'John',
//         personLastName: 'Smith',
//         role: 'Role A',
//         team: 'XYZ',
//         currentTask: 'Task 1',
//         totalHrs: 169,
//         todayHrs: 5.5,
//       },
//     ],
//   },
// ];

export function BMDashboard() {

  const [projects, setProjects] = useState([]);

  const fetchData = async () => {
    const { data } = await axios.get(ENDPOINTS.BM_PROJECTS_LIST);
    console.log('fetched', data);
    setProjects(data);
  };

  // fetch projects data on pageload
  useEffect(() => {
    fetchData();
    console.log('projects', projects)
  }, []);

  return (
    <Container className="justify-content-center align-items-center mw-80 px-4">
      <header className="bm-dashboard__header">
        <h1>Building and Inventory Management Dashboard</h1>
      </header>
      <main>
        {projects.length ? (
          <>
            <ProjectSelectForm projects={projects} />
            <ProjectsList projects={projects} />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </main>
    </Container>
  );
}

// const mapStateToProps = state => ({
//   auth: state.auth,
// });

// export default connect(mapStateToProps)(BMDashboard);

export default BMDashboard;
