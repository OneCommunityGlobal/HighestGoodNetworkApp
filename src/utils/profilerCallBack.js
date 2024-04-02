const onRenderProfiler = (
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) => {
  console.log(`
    id: ${id},
    phase: ${phase},
    actualDuration: ${actualDuration},
    baseDuration: ${baseDuration},
    startTime: ${startTime},
    commitTime: ${commitTime},
    interactions: ${interactions}
  `);
};

export default onRenderProfiler;