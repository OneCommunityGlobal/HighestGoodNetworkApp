import _ from 'lodash';
export const getcolor = (effort,commit) => {
  let color = 'white';
  let percentage = 0;
  if (commit>0){
    percentage = Math.round(effort*100/commit);
  }
  if (_.inRange(percentage, 0, 20)) color = 'danger'; //red
  if (_.inRange(percentage, 20, 40)) color = 'orange'; //orange
  if (_.inRange(percentage, 40, 60)) color = 'success'; //green
  if (_.inRange(percentage, 60, 80)) color = 'primary'; //blue
  if (_.inRange(percentage, 80, 100)) color = 'super'; //indigo
  //if (_.inRange(percentage, 40, 50)) color = 'awesome'; //violet
  if (percentage >= 100) color = 'super-awesome'; //purple
  return color;
};

export const getprogress = (effort,commit) => {
  let percentage = 0;
  if (commit>0){
    percentage = Math.round(effort*100/commit)
    if (percentage>100) percentage = 100;
  }
  return percentage;
};

export default getcolor;
