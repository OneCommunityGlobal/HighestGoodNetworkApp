const dummyProject = {
  projectId: 1,
  projectName: 'Big project',
  tools: [
    {
      inventoryItemId: 1,
      title: 'forklift',
      image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
      rentedOnDate: '',
      rentDuration: '',
      cost: '200',
    },
    {
      inventoryItemId: 2,
      title: 'saw',
      image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
      rentedOnDate: '',
      rentDuration: '',
      cost: '200',
    },
  ],
  materials: [
    {
      inventoryItemId: 3,
      title: 'soil mix',
      image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
      amountTotal: '100lb',
      amountUsed: '80lb',
      cost: '200',
      amountWasted: '10lb',
    },
    {
      inventoryItemId: 4,
      title: '1/2" pea gravel',
      image: 'https://www.theforkliftcenter.com/images/forklift-hero-left.png',
      amountTotal: '100lb',
      amountUsed: '95lb',
      cost: '200',
      amountWasted: '10lb',
    },
  ],
  teams: [
    {
      teamId: 1,
      name: 'ABC',
    },
    {
      teamId: 2,
      name: 'XYZ',
    },
  ],
  people: [
    {
      personId: 1,
      personName: 'Dora',
      personLastName: 'Kimberly',
      role: 'Carpenter',
      team: 'XYZ',
      currentTask: 'Stud wall construction',
      totalHrs: 169,
      todayHrs: 5.5,
    },
    {
      personId: 2,
      personName: 'Cailin',
      personLastName: 'Colby',
      role: 'Volunteer',
      team: 'ABC',
      currentTask: 'Foundation concreting',
      totalHrs: 15,
      todayHrs: 5,
    },
    {
      personId: 3,
      personName: 'John',
      personLastName: 'Smith',
      role: 'Role A',
      team: 'XYZ',
      currentTask: 'Task 1',
      totalHrs: 169,
      todayHrs: 5.5,
    },
  ],
};

function ProjectSummary({ project }) {
  return (
    <>
      <h2 className="project-summary_header">{project.projectName} summary</h2>
      <div className="project-summary_content">
        <div className="project-summary_item">
          Total hours of work done: <span className="project-summary_span"></span>
        </div>
        <div className="project-summary_item">
          Total cost of materials: <span className="project-summary_span"></span>
        </div>
        <div className="project-summary_item">
          Total cost of equipment: <span className="project-summary_span"></span>
        </div>
        <div className="project-summary_item">
          Total wastage: <span className="project-summary_span"></span>
        </div>
        <div className="project-summary_item">
          No of teams: <span className="project-summary_span"> {project.teams.length}</span>
        </div>
        <div className="project-summary_item">
          Total number of tools/equipment:{' '}
          <span className="project-summary_span">{project.tools.length}</span>
        </div>
        <div className="project-summary_item">
          Equipment return due in 72hrs: <span className="project-summary_span"></span>
        </div>
        <div className="project-summary_item">
          Number of materials with quantity less than 20% left:{' '}
          <span className="project-summary_span"></span>
        </div>
      </div>
    </>
  );
}

export default ProjectSummary;
