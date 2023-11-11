// function calculateTotalCost(items) {
//   return items.reduce((total, item) => total + parseInt(item.cost, 10), 0);
// }

function ProjectSummary({ project }) {
  // const totalMaterialsCost = calculateTotalCost(project.materials);
  // const totalEquipmentCost = calculateTotalCost(project.tools);

  return (
    <>
      <h2 className="project-summary_header">{project.name} summary</h2>
      <div className="project-summary_content">
        {/* <div className="project-summary_item">
          Total hours of work done: <span className="project-summary_span" />
        </div> */}
        {/* <div className="project-summary_item">
          Total cost of materials:{' '}
          <span className="project-summary_span">{totalMaterialsCost} </span>
        </div> */}
        {/* <div className="project-summary_item">
          Total cost of equipment:{' '}
          <span className="project-summary_span">{totalEquipmentCost}</span>
        </div> */}
        {/* <div className="project-summary_item">
          Total wastage: <span className="project-summary_span" />
        </div> */}
        <div className="project-summary_item">
          No of teams: <span className="project-summary_span"> {project.team.length}</span>
        </div>
        {/* <div className="project-summary_item">
          Total number of tools/equipment:{' '}
          <span className="project-summary_span">{project.tools.length}</span>
        </div> */}
        {/* <div className="project-summary_item">
          Equipment return due in 72hrs: <span className="project-summary_span" />
        </div> */}
        {/* <div className="project-summary_item">
          Number of materials with quantity less than 20% left:{' '}
          <span className="project-summary_span" />
        </div> */}
      </div>
    </>
  );
}

export default ProjectSummary;
